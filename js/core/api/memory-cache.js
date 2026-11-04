// Copias de las lecturas en memoria, para pintar al instante una pantalla ya vista (ver read-cache.js).
// Viven solo mientras la app está abierta. Cualquier escritura o cierre de sesión las borra todas.
const entries = new Map(); // clave -> { data, at }
let epoch = 0;

/** Una copia más reciente que esto no se vuelve a pedir al servidor. */
export const FRESH_MS = 5000;

export const getEntry = (key) => entries.get(key);
export const setEntry = (key, data, at = Date.now()) => entries.set(key, { data, at });
export const currentEpoch = () => epoch;

/** Olvida todo. Las lecturas que estaban en vuelo antes de esta llamada ya no se guardan. */
export function clearMemoryCache() {
  epoch++;
  entries.clear();
}

// Gancho solo para las pruebas: les permite olvidar las copias cuando cambian la base de datos sin pasar por la app.
(globalThis.__AJ_TEST_HOOKS ||= { clear: new Set() }).clear.add(clearMemoryCache);
