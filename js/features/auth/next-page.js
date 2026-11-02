// A dónde seguir después de entrar con el código: la pantalla que se quería abrir.
const KEY = 'aj.next';

export function rememberNext(path) {
  try { sessionStorage.setItem(KEY, path); } catch { /* sin almacenamiento */ }
}

/** Devuelve (y olvida) la pantalla pendiente, o `fallback` (un '#/…') si no había ninguna. */
export function takeNext(fallback) {
  try {
    const path = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return path ? `#${path}` : fallback;
  } catch {
    return fallback;
  }
}
