// Cada lectura correcta se guarda en el dispositivo. Si más tarde no hay conexión,
// se muestra la última copia en lugar de un error. Los ajustes (settings, donde está
// el PIN) nunca se guardan aquí.
import { CACHE_PREFIX } from './cache-store.js';
import { buildQuery } from './query.js';
import { request } from './request.js';
import { isRetryable } from './retry.js';

const NO_CACHE_TABLES = new Set(['settings']);

export async function cachedGet(table, path, query) {
  const cacheable = !NO_CACHE_TABLES.has(table);
  const cacheKey = `${CACHE_PREFIX}${path}${buildQuery(query)}`;
  try {
    const data = await request('GET', path, { query });
    if (cacheable) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch {
        /* almacenamiento lleno: se sigue sin caché */
      }
    }
    return data;
  } catch (err) {
    const stale = cacheable && isRetryable(err) ? localStorage.getItem(cacheKey) : null;
    if (stale) return JSON.parse(stale);
    throw err;
  }
}
