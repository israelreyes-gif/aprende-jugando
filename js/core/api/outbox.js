// Cola de escrituras hechas sin conexión. Se reenvían solas cuando vuelve la red.
import { isConfigured } from './connection.js';
import { insertRows } from './request.js';
import { isRetryable } from './retry.js';
import { readOutbox, writeOutbox } from './outbox-store.js';
import { logSync } from './sync-log.js';

const reason = (err) => (err.status ? `error ${err.status}` : 'sin conexión');

let flushing = false;

/** Reenvía las escrituras pendientes en orden. Se detiene al primer fallo recuperable. */
export async function flushOutbox() {
  if (flushing || !isConfigured()) return;
  flushing = true;
  try {
    let items = readOutbox();
    while (items.length > 0) {
      const [first, ...rest] = items;
      try {
        await insertRows(first.table, first.rows, first.conflict);
        logSync({ outcome: 'late', what: first.table, detail: 'guardado al volver la conexión', profileId: first.profileId });
      } catch (err) {
        if (isRetryable(err)) return;
        console.warn('Se descarta una escritura rechazada por el servidor:', err.message);
        logSync({ outcome: 'failed', what: first.table, detail: reason(err), profileId: first.profileId });
      }
      items = rest;
      writeOutbox(items);
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
    await insertRows(table, rows, conflict);
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
