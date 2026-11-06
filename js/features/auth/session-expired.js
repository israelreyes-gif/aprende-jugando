import { go } from '../../core/router.js';
import { notify } from '../../shared/modal.js';
import { PARENT_OWNER } from '../../core/api/session-store.js';

let showing = false;

/**
 * Avisa de que la sesión ha caducado, sin quitar la pantalla de debajo. Al pulsar el botón, Esc o tocar fuera
 * (la ventana tapa los demás enlaces) se va a la pantalla del código; después se vuelve a donde se estaba.
 */
export async function announceExpiry(owner, loginHref) {
  if (showing) return;
  showing = true;
  await notify({
    kind: 'info',
    title: 'Sesión caducada',
    message: owner === PARENT_OWNER
      ? 'La sesión de padres ha caducado por inactividad. Vuelve a introducir tu código para seguir.'
      : 'Tu sesión ha caducado. Vuelve a introducir tu código para seguir.',
    button: 'Introducir código',
  });
  showing = false;
  go(loginHref);
}
