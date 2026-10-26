import { openModal } from './modal/modal-dialog.js';

/**
 * Aviso con un solo botón. kind: 'info' | 'success' | 'error'.
 * Devuelve una promesa que se cumple al cerrarlo.
 */
export async function notify({ kind = 'info', title, message, button = 'Entendido' }) {
  await openModal({ kind, title, message, actions: [{ label: button, value: true, style: 'primary' }], dismissValue: true });
}

/**
 * Pregunta con dos botones. Devuelve una promesa con true (aceptar) o false (cancelar, Esc o tocar fuera).
 * danger: pinta la ventana y el botón en rojo (para borrar). El foco empieza en "Cancelar".
 */
export function confirmDialog({ title, message, confirm = 'Aceptar', cancel = 'Cancelar', danger = false }) {
  return openModal({
    kind: danger ? 'danger' : 'info',
    title,
    message,
    actions: [
      { label: cancel, value: false, style: 'outline' },
      { label: confirm, value: true, style: danger ? 'bad' : 'primary' },
    ],
    dismissValue: false,
    initialFocus: 0,
  });
}
