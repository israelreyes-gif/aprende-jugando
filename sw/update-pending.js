// Marca de "hay una versión nueva sin avisar": sobrevive aunque el service worker se apague entre medias.
const PENDING_KEY = './update-pending';

/** Anota que hay una versión nueva pendiente de avisar. */
async function markPending() {
  const cache = await caches.open(CACHE);
  await cache.put(PENDING_KEY, new Response('1'));
}

/** Quita la marca; devuelve true si estaba puesta. */
async function takePending() {
  const cache = await caches.open(CACHE);
  return cache.delete(PENDING_KEY);
}
