// Dónde se guardan en el dispositivo las copias de las lecturas.
export const CACHE_PREFIX = 'aj.cache:';

export function clearReadCache() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(CACHE_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
}
