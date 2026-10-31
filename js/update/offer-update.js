import { confirmDialog } from '../shared/modal.js';

const SNOOZE_MS = 10 * 60 * 1000;
let snoozedUntil = 0;
let asking = false;

/** Pregunta si se quiere actualizar; si dice que sí, llama a `onAccept`. Con "Ahora no" no vuelve a preguntar en 10 minutos. */
export async function offerUpdate(onAccept) {
  if (asking || Date.now() < snoozedUntil) return;
  asking = true;
  const accepted = await confirmDialog({
    title: 'Hay una versión nueva',
    message: 'Actualiza la app para ver las últimas mejoras. Seguirás en esta misma pantalla.',
    confirm: 'Actualizar',
    cancel: 'Ahora no',
  });
  asking = false;
  if (accepted) onAccept();
  else snoozedUntil = Date.now() + SNOOZE_MS;
}
