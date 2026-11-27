import { confirmDialog } from '../../shared/modal.js';

/**
 * Pide confirmación al tocar la flecha de volver de la cabecera mientras hay una sesión a medias.
 * isActive(): true si ya hay respuestas y la sesión no ha terminado (entonces salir las perdería).
 */
export function guardLeave(view, { t, isActive }) {
  const link = view.querySelector('.app-header a.icon-btn');
  if (!link) return;
  link.addEventListener('click', async (event) => {
    if (!isActive()) return;
    event.preventDefault();
    const leave = await confirmDialog({ title: t.leaveTitle, message: t.leaveMessage, confirm: t.leaveConfirm, cancel: t.leaveStay, danger: true });
    if (leave) location.hash = link.getAttribute('href');
  });
}
