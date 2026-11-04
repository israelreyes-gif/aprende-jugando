// Lecturas con caché en dos niveles:
// - En memoria: si la pantalla ya se vio, se pinta al instante con esa copia y se pide una nueva en segundo plano;
//   si los datos han cambiado, se avisa para repintar (ver core/router.js).
// - En el dispositivo (localStorage): si no hay conexión se muestra la última copia en lugar de un error.
//   También pinta al instante la primera vez tras abrir la app, salvo los datos de la zona de padres,
//   y solo hasta la primera escritura o cambio de sesión (después esa copia podría estar vieja).
// Los ajustes (settings) nunca se guardan aquí.
import { CACHE_PREFIX } from './cache-store.js';
import { buildQuery } from './query.js';
import { request } from './request.js';
import { isRetryable } from './retry.js';
import { PARENT_OWNER } from './session-store.js';
import { pickSession } from './session-token.js';
import { FRESH_MS, clearMemoryCache, currentEpoch, getEntry, setEntry } from './memory-cache.js';
import { emitDataEvent } from './data-events.js';

const NO_CACHE_TABLES = new Set(['settings']);
const inflight = new Map();

function readDevice(cacheKey) {
  try {
    const text = localStorage.getItem(cacheKey);
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

async function fetchFresh(path, query, memKey, cacheKey, { fallback }) {
  const epoch = currentEpoch();
  try {
    const data = await request('GET', path, { query });
    if (epoch === currentEpoch()) setEntry(memKey, data); // si hubo una escritura mientras tanto, esta copia puede estar vieja
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch {
      /* almacenamiento lleno: se sigue sin caché */
    }
    return data;
  } catch (err) {
    const stale = fallback && isRetryable(err) ? readDevice(cacheKey) : null; // al refrescar en segundo plano no: ahí un error de sesión debe avisar
    if (stale) return stale;
    throw err;
  }
}

/** Una sola petición por lectura a la vez: si ya hay una igual en vuelo, se comparte. */
function shared(memKey, make) {
  if (inflight.has(memKey)) return inflight.get(memKey);
  const promise = make().finally(() => inflight.delete(memKey));
  inflight.set(memKey, promise);
  return promise;
}

function revalidate(path, query, memKey, cacheKey, shown) {
  shared(memKey, () => fetchFresh(path, query, memKey, cacheKey, { fallback: false }))
    .then((data) => {
      if (JSON.stringify(data) !== JSON.stringify(shown)) emitDataEvent('changed');
    })
    .catch((err) => {
      if (err.code === 'auth') {
        clearMemoryCache(true);
        emitDataEvent('auth');
      }
    });
}

export async function cachedGet(table, path, query) {
  const cacheable = !NO_CACHE_TABLES.has(table);
  const cacheKey = `${CACHE_PREFIX}${path}${buildQuery(query)}`;
  if (!cacheable) return request('GET', path, { query });

  const { owner } = pickSession(path, query);
  const memKey = `${owner}|${cacheKey}`;

  let hit = getEntry(memKey);
  if (!hit && owner !== PARENT_OWNER && currentEpoch() === 0) {
    const onDevice = readDevice(cacheKey);
    if (onDevice) hit = { data: onDevice, at: 0 }; // primera pantalla tras abrir la app
  }
  if (hit) {
    if (Date.now() - hit.at > FRESH_MS) revalidate(path, query, memKey, cacheKey, hit.data);
    return hit.data;
  }
  return shared(memKey, () => fetchFresh(path, query, memKey, cacheKey, { fallback: true }));
}
