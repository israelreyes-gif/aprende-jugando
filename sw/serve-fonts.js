// Fuentes de Google: copia guardada primero (no cambian).
async function serveFont(request) {
  const cache = await caches.open(FONTS_CACHE);
  const kept = await cache.match(request);
  if (kept) return kept;
  try {
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}
