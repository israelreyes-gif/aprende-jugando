// Cola de escrituras hechas sin conexión. Se reenvían solas cuando vuelve la red.
import { isConfigured } from './connection.js';
import { insertRows } from './request.js';
import { isRetryable } from './retry.js';
import { readOutbox, writeOutbox } from './outbox-store.js';
import { logSync } from './sync-log.js';

const reason = (err) => (err.status ? `error ${err.status}` : 'sin conexión');

let flushing = false;

/** ¿Es un fallo que afecta solo a un perfil (su sesión caducó)? Los demás perfiles pueden seguir. */
const isProfileOnly = (err) => err.code === 'auth';

/** Se identifica cada escritura por su contenido (los ids de las filas los genera el cliente). */
const keyOf = (item) => JSON.stringify(item);

/**
 * Reenvía las escrituras pendientes en orden. Una sesión caducada solo aparca las escrituras de ese perfil
 * (se guardan hasta que vuelva a entrar) y no frena las de los demás; un fallo de red o del servidor detiene todo.
 * Lo que se encola mientras se reenvía no se pierde: cada vuelta lee la cola de nuevo y solo quita lo ya resuelto.
 */
export async function flushOutbox() {
  if (flushing || !isConfigured()) return;
  flushing = true;
  try {
    const parked = new Set();
    const done = new Set();
    const resolved = (item) => {
      done.add(keyOf(item));
      writeOutbox(readOutbox().filter((x) => !done.has(keyOf(x))));
    };
    for (;;) {
      const pending = readOutbox().filter((x) => !done.has(keyOf(x)) && !parked.has(x.profileId || ''));
      if (pending.length === 0) return;
      const first = pending[0];
      try {
        await insertRows(first.table, first.rows, first.conflict, first.profileId || undefined);
        logSync({ outcome: 'late', what: first.table, detail: 'guardado al volver la conexión', profileId: first.profileId });
      } catch (err) {
        if (isProfileOnly(err)) { parked.add(first.profileId || ''); continue; }
        if (isRetryable(err)) return;
        console.warn('Se descarta una escritura rechazada por el servidor:', err.message);
        logSync({ outcome: 'failed', what: first.table, detail: reason(err), profileId: first.profileId });
      }
      resolved(first);
    }
  } finally {
    flushing = false;
  }
}

/**
 * Inserta con cola offline: si no hay conexión, la escritura se guarda en el
 * dispositivo y se reenvía sola más tarde. Devuelve { queued: boolean }.
 * Usar siempre con ids generados en el cliente y conflict: 'ignore' (idempotente).
 */
export async function queueInsert(table, rows, { conflict = 'ignore', profileId = null } = {}) {
  const item = { table, rows, conflict, profileId };
  if (readOutbox().length > 0) {
    writeOutbox([...readOutbox(), item]);
    flushOutbox();
    return { queued: true };
  }
  try {
    await insertRows(table, rows, conflict, profileId || undefined);
    return { queued: false };
  } catch (err) {
    if (!isRetryable(err)) {
      logSync({ outcome: 'failed', what: table, detail: reason(err), profileId });
      throw err;
    }
    writeOutbox([item]);
    return { queued: true };
  }
}
