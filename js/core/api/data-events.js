// Aviso de que, tras pintar una copia guardada, el servidor devolvió datos distintos (o dijo que la sesión ya no vale).
const listeners = new Set();

export function onDataEvent(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** reason: 'changed' (hay datos nuevos) | 'auth' (la sesión ya no vale; detail = el error). */
export function emitDataEvent(reason, detail) {
  listeners.forEach((fn) => fn(reason, detail));
}
