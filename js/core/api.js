// Punto de entrada único para hablar con el Worker. Cada pieza vive en core/api/.
import { cachedGet } from './api/read-cache.js';
import { insertRows, request } from './api/request.js';
import { queueInsert } from './api/outbox.js';

export { getConnection, setConnection, isConfigured } from './api/connection.js';
export { flushOutbox } from './api/outbox.js';
export { pendingCount } from './api/outbox-store.js';

export const api = {
  /** Devuelve un array de filas. where: { columna: valor | [valores] } */
  list: (table, options = {}) => cachedGet(table, table, options),

  /** Devuelve una fila por id, o null si no existe. */
  async get(table, id) {
    try {
      return await cachedGet(table, `${table}/${encodeURIComponent(id)}`);
    } catch (err) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  /** Inserta una fila o una lista de filas. conflict: 'ignore' | 'replace' */
  insert: (table, rows, { conflict } = {}) => insertRows(table, rows, conflict),

  update: (table, where, patch) => request('PATCH', table, { query: { where }, body: patch }),

  remove: (table, where) => request('DELETE', table, { query: { where } }),

  /** Inserta con cola offline (ver api/outbox.js). */
  queueInsert,
};
