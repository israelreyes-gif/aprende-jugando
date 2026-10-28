import { paths } from '../../../core/paths.js';
import { sendPush } from '../../../data/push-send.js';

/**
 * Avisa a los móviles de los padres ({ title, body }). Nunca molesta a quien lo llama:
 * si no hay conexión o el aviso falla, no pasa nada (el resultado ya está guardado).
 */
export function notifyParents(message) {
  if (navigator.onLine === false) return;
  sendPush('parents', { ...message, url: paths.parents() }).catch((err) => console.warn('No se pudo avisar a los padres', err));
}
