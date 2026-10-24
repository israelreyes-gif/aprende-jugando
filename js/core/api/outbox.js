// Cola de escrituras hechas sin conexión. Se reenvían solas cuando vuelve la red.
import { isConfigured } from './connection.js';
import { insertRows } from './request.js';
import { isRetryable } from './retry.js';
import { readOutbox, writeOutbox } from './outbox-store.js';

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
      } catch (err) {
        if (isRetryable(err)) return;
        console.warn('Se descarta una escritura rechazada por el servidor:', err.message);
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
export async function queueInsert(table, rows, { conflict = 'ignore' } = {}) {
  const item = { table, rows, conflict };
  if (readOutbox().length > 0) {
    writeOutbox([...readOutbox(), item]);
    flushOutbox();
    return { queued: true };
  }
  try {
    await insertRows(table, rows, conflict);
    return { queued: false };
  } catch (err) {
    if (!isRetryable(err)) throw err;
    writeOutbox([item]);
    return { queued: true };
  }
}
