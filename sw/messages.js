// Mensajes que manda la página al service worker.
//  - 'page-ready': la página ya escucha; si había una versión nueva sin avisar, se le avisa ahora.
//  - 'update-seen': la página recibió el aviso; se quita la marca para no repetirlo.
self.addEventListener('message', (event) => {
  const type = event.data?.type;
  if (type === 'update-seen') {
    event.waitUntil(takePending());
  } else if (type === 'page-ready') {
    event.waitUntil(
      takePending().then((found) => {
        if (found) event.source?.postMessage({ type: 'app-updated' });
      }),
    );
  }
});
