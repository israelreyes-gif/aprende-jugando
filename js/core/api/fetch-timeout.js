/** Tiempo máximo de espera de una petición al servidor. */
export const REQUEST_TIMEOUT_MS = 15000;

/**
 * Como fetch, pero si el servidor no contesta a tiempo lanza un Error con status 408
 * (se puede reintentar) en vez de dejar la app en "Cargando…" para siempre.
 */
export async function fetchWithTimeout(url, options = {}, ms = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted) {
      throw Object.assign(new Error('El servidor tarda demasiado en responder'), { status: 408, code: 'timeout' });
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
