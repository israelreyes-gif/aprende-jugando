// Estrategias de caché.

// Copia guardada primero, y por detrás se pregunta al servidor si hay algo nuevo (cache: 'no-cache')
// para dejar la copia al día. Así la app abre al instante; los cambios nuevos se ven en la
// siguiente apertura. Si un archivo guardado ha cambiado en el servidor, se avisa a la app
// (ver update-check.js) para que ofrezca actualizar. Sin copia guardada, se pide al servidor;
// sin red, se avisa.
async function staleWhileRevalidate(event) {
  const { request } = event;
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });
  // Copia aparte para comparar: la que se devuelve a la página se "gasta" al leerla.
  const previous = cached ? cached.clone() : null;

  const update = fetch(request, { cache: 'no-cache' })
    .then(async (response) => {
      if (response.ok) {
        if (previous) await checkForUpdate(previous, response);
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    event.waitUntil(update);
    return cached;
  }

  const response = await update;
  if (response) return response;
  if (request.mode === 'navigate') {
    const shell = await cache.match('./index.html');
    if (shell) return shell;
  }
  return new Response('Sin conexión', { status: 503, statusText: 'Offline' });
}

// Copia guardada primero (para las fuentes de Google, que no cambian).
async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}
