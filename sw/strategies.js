// Estrategias de caché.

// Pregunta siempre al servidor si el archivo ha cambiado (cache: 'no-cache'):
// si no ha cambiado el servidor responde "sin cambios" y se usa la copia, y si ha cambiado
// se descarga la nueva. Sin conexión, se usa la copia guardada.
async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request, { cache: 'no-cache' });
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate') {
      const shell = await cache.match('./index.html');
      if (shell) return shell;
    }
    return new Response('Sin conexión', { status: 503, statusText: 'Offline' });
  }
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
