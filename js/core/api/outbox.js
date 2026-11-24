// Cola de escrituras hechas sin conexión. Se reenvían solas cuando vuelve la red.
import { isConfigured } from './connection.js';
import { insertRows } from './request.js';
import { isRetryable } from './retry.js';
import { readOutbox, writeOutbox } from './outbox-store.js';
import { logSync } from './sync-log.js';
import { keyOf, isServerError, shouldGiveUp, markFailing } from './outbox-poison.js';

const reason = (err) => (err.status ? `error ${err.status}` : 'sin conexión');

let flushing = false;

/** ¿Es un fallo que afecta solo a un perfil (su sesión caducó)? Los demás perfiles pueden seguir. */
const isProfileOnly = (err) => err.code === 'auth';

/**
 * Reenvía las escrituras pendientes en orden. Una sesión caducada solo aparca las escrituras de ese perfil
 * (se guardan hasta que vuelva a entrar) y no frena las de los demás; un fallo de red o del servidor detiene todo
 * (si el servidor falla con la misma escritura durante días, se descarta: ver outbox-poison.js).
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
        if (isRetryable(err)) {
          // Un error del servidor que no se va: pasado un tiempo se descarta esa escritura para no bloquear las demás.
          if (!isServerError(err)) return;
          if (!shouldGiveUp(first)) { writeOutbox(markFailing(readOutbox(), first)); return; }
          console.warn('Se descarta una escritura que el servidor no acepta desde hace días:', err.message);
          logSync({ outcome: 'failed', what: first.table, detail: `${reason(err)} durante días`, profileId: first.profileId });
          resolved(first);
          continue;
        }
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
  if (readOutbox().length > 0 && writeOutbox([...readOutbox(), item])) {
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
    if (writeOutbox([...readOutbox(), item])) return { queued: true };
    // No cabe en el dispositivo: no se finge que se guardó, el error llega a quien intentaba guardar.
    logSync({ outcome: 'failed', what: table, detail: 'no cabe en el dispositivo', profileId });
    throw err;
  }
}
