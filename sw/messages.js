// Mensajes que manda la página al service worker.
//  - 'skip-waiting': el usuario ha pulsado "Actualizar"; la versión nueva (ya descargada entera) pasa a usarse.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'skip-waiting') self.skipWaiting();
});
