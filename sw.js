// Service worker de Aprende y juega.
//  - Archivos de la propia app: red primero (los cambios de GitHub llegan enseguida)
//    y, sin conexión, la copia guardada.
//  - Fuentes de Google: copia guardada primero.
//  - El Worker de datos (otro dominio) NO se toca: la app gestiona su propia cola offline.
importScripts('./sw/config.js', './sw/strategies.js');

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
  } else if (isFont) {
    event.respondWith(cacheFirst(request));
  }
});
