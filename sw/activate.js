// Al activarse una versión: se borran las copias de las demás versiones y esta toma el control de la app.
async function removeOtherBuilds() {
  const names = await caches.keys();
  await Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE).map((name) => caches.delete(name)));
}

self.addEventListener('activate', (event) => event.waitUntil(removeOtherBuilds().then(() => self.clients.claim())));
