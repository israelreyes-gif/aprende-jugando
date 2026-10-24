// Cómo se guarda la cola de escrituras pendientes en el dispositivo.
const KEY_OUTBOX = 'aj.outbox';

export function readOutbox() {
  try {
    return JSON.parse(localStorage.getItem(KEY_OUTBOX) || '[]');
  } catch {
    return [];
  }
}

export function writeOutbox(items) {
  localStorage.setItem(KEY_OUTBOX, JSON.stringify(items));
}

export function pendingCount() {
  return readOutbox().length;
}
