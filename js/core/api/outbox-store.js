// Cómo se guarda la cola de escrituras pendientes en el dispositivo.
const KEY_OUTBOX = 'aj.outbox';

export function readOutbox() {
  try {
    return JSON.parse(localStorage.getItem(KEY_OUTBOX) || '[]');
  } catch {
    return [];
  }
}

/** Guarda la cola. Devuelve false si no ha podido (por ejemplo, almacenamiento lleno): nunca finge que se guardó. */
export function writeOutbox(items) {
  try {
    localStorage.setItem(KEY_OUTBOX, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

export function pendingCount() {
  return readOutbox().length;
}
