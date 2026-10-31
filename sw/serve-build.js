// Los archivos de la propia app se sirven SIEMPRE de la copia de esta versión (nada de preguntar por detrás).
// Solo si falta uno (el móvil borró la copia por falta de espacio) se pide a internet, y se guarda si es el archivo bueno.

/** "./js/main.js" para la dirección completa de un archivo de la app. */
function appPath(url) {
  const scope = new URL(self.registration.scope).pathname;
  return `./${decodeURIComponent(new URL(url).pathname.slice(scope.length))}`;
}

async function healFile(cache, request, response) {
  const hash = FILES[appPath(request.url)];
  if (hash && response.ok && (await fingerprintOf(response)) === hash) await cache.put(request, response.clone());
}

async function serveFromBuild(request) {
  const cache = await caches.open(CACHE);
  // La app es de una sola página: cualquier navegación abre index.html.
  const kept = await cache.match(request.mode === 'navigate' ? './index.html' : request, { ignoreSearch: true });
  if (kept) return kept;
  try {
    const response = await fetch(request);
    await healFile(cache, request, response).catch(() => {});
    return response;
  } catch {
    return new Response('Sin conexión', { status: 503, statusText: 'Offline' });
  }
}
