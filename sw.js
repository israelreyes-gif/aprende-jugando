// Service worker de Aprende y juega.
//  - Cada versión de la app se descarga ENTERA a una copia aparte (sw/install.js) y solo se usa cuando está completa:
//    nunca se mezclan archivos de dos versiones. La nueva espera hasta que la página avisa y el usuario pulsa "Actualizar".
//  - Los archivos de la app (incluidas las fuentes, en fonts/) se sirven de la copia de su versión (sw/serve-build.js).
//  - El Worker de datos (otro dominio) NO se toca: la app gestiona su propia cola offline.
//  - Avisos push: se muestran y, al tocarlos, se abre la app (sw/push.js y sw/notification-click.js).
importScripts('./sw/manifest.js', './sw/config.js', './sw/fingerprint.js', './sw/install.js', './sw/activate.js', './sw/serve-build.js', './sw/messages.js', './sw/push.js', './sw/notification-click.js');

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin === self.location.origin) event.respondWith(serveFromBuild(request));
});
