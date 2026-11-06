// Dónde se guardan en el dispositivo las copias de las lecturas.
export const CACHE_PREFIX = 'aj.cache:';

export function clearReadCache() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(CACHE_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
}

// Versión del formato de la caché del dispositivo. Al subirla se borra lo guardado por versiones anteriores
// (la 2 es la primera que no guarda lecturas de la zona de padres: se eliminan las que hubiera).
const CACHE_VERSION = '2';
const VERSION_KEY = 'aj.cache-version';

export function migrateReadCache() {
  try {
    if (localStorage.getItem(VERSION_KEY) === CACHE_VERSION) return;
    clearReadCache();
    localStorage.setItem(VERSION_KEY, CACHE_VERSION);
  } catch {
    /* sin almacenamiento */
  }
}
