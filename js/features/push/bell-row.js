import { h } from '../../core/dom.js';
import { isDeviceRegistered } from '../../data/push-devices.js';
import { icon } from '../../shared/icons.js';
import { notify } from '../../shared/modal.js';
import { switchButton } from '../../shared/switch-button.js';
import { currentSubscription } from './device-subscription.js';
import { turnOff, turnOn } from './device-toggle.js';
import { pushSupport } from './push-support.js';

const NEEDS_INSTALL = 'Para activar los avisos, instala la app (Compartir → Añadir a pantalla de inicio) y ábrela desde su icono.';
const UNSUPPORTED = 'Este navegador no puede recibir avisos.';
const CHECK_FAILED = 'No se ha podido comprobar. Revisa la conexión.';

/**
 * Fila con una campanita para activar o desactivar los avisos en ESTE móvil.
 * kind: 'child' (con profileId) o 'parent'. onState(activo): se llama al comprobar y al cambiar. welcome: { title, body } del aviso que llega al activarlos.
 */
export function bellRow({ kind, profileId, title, meta, welcome, onState }) {
  const report = (active) => onState && onState(active);
  const target = kind === 'parent' ? 'parents' : { profile_id: profileId };
  const metaText = h('span', { class: 'switch-row__meta' }, meta);

  const toggle = switchButton({
    checked: false,
    disabled: true,
    label: title,
    onChange: async (value) => {
      try {
        if (!value) {
          await turnOff({ kind, profileId });
          return report(false);
        }
        const { welcomeSent } = await turnOn({ kind, profileId, target, welcome });
        report(true);
        if (!welcomeSent) notify({ kind: 'info', title: 'Avisos activados', message: 'Se han activado, pero no se ha podido enviar el aviso de prueba.' });
      } catch (err) {
        if (err.code === 'denied') {
          notify({ kind: 'error', title: 'Avisos bloqueados', message: 'Este móvil no ha dado permiso. Actívalos en Ajustes → Notificaciones → Aprende y juega.' });
        } else {
          notify({ kind: 'error', title: 'No se pudo guardar', message: 'Revisa la conexión e inténtalo de nuevo.' });
        }
        throw err;
      }
    },
  });

  async function start() {
    const support = pushSupport();
    if (support !== 'ok') {
      metaText.textContent = support === 'install' ? NEEDS_INSTALL : UNSUPPORTED;
      return;
    }
    try {
      const subscription = await currentSubscription();
      const active = Boolean(subscription) && Notification.permission === 'granted' && (await isDeviceRegistered({ kind, profileId, endpoint: subscription.endpoint }));
      toggle.setAttribute('aria-checked', String(active));
      toggle.disabled = false;
      report(active);
    } catch (err) {
      console.warn(err);
      metaText.textContent = CHECK_FAILED;
    }
  }
  start();

  return h(
    'div',
    { class: 'switch-row' },
    h('span', { class: 'switch-row__icon' }, icon('bell')),
    h('span', { class: 'switch-row__text' }, h('span', { class: 'switch-row__title' }, title), metaText),
    toggle,
  );
}
