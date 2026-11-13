import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { appHeader } from '../../shared/app-header.js';
import { confirmDialog, notify } from '../../shared/modal.js';
import { passkeysSupported, setLocalPasskey } from '../../core/webauthn/support.js';
import { deletePasskey, listPasskeys, registerPasskey } from '../../data/passkey.repo.js';
import { reload } from '../../core/router.js';

const when = (iso) => (iso ? new Date(iso).toLocaleDateString('es-ES') : 'nunca');

/** Zona de padres → Face ID: activarlo en este móvil y quitar móviles. El código sigue valiendo siempre. */
export async function faceIdScreen() {
  const header = appHeader({ title: 'Face ID', sub: 'Entrar sin escribir el código', back: paths.parents(), shield: true });
  if (!passkeysSupported()) {
    return h('main', { class: 'screen' }, header, h('div', { class: 'screen__body' }, h('p', { class: 'lead' }, 'Este navegador no admite Face ID. Prueba desde la app en la pantalla de inicio del iPhone.')));
  }
  const devices = await listPasskeys();
  const error = h('p', { class: 'field__error', role: 'alert' });
  const label = h('input', { class: 'input', id: 'faceid-label', type: 'text', maxlength: '60', value: 'Mi iPhone', 'aria-label': 'Nombre de este móvil' });
  const enable = h('button', { class: 'btn btn--primary btn--block', type: 'button' }, 'Activar Face ID en este móvil');

  enable.addEventListener('click', async () => {
    error.textContent = '';
    enable.disabled = true;
    try {
      await registerPasskey(label.value.trim() || 'Mi iPhone');
      await notify({ kind: 'success', title: 'Face ID activado', message: 'La próxima vez podrás entrar a la zona de padres con la cara. El código sigue valiendo.' });
      reload();
    } catch (err) {
      if (err?.name !== 'NotAllowedError') error.textContent = 'No se ha podido activar Face ID en este móvil.';
      enable.disabled = false;
    }
  });

  const row = (device) => {
    const remove = h('button', { class: 'btn btn--outline faceid-device__remove', type: 'button' }, 'Quitar');
    remove.addEventListener('click', async () => {
      if (!(await confirmDialog({ title: `¿Quitar «${device.label}»?`, message: 'Ese móvil ya no podrá entrar con Face ID. Con el código sí.', confirm: 'Quitar', danger: true }))) return;
      await deletePasskey(device.id);
      if (devices.length === 1) setLocalPasskey(false);
      reload();
    });
    return h('div', { class: 'card row-card faceid-device' },
      h('span', { class: 'tile tile--sm', 'aria-hidden': 'true' }, '📱'),
      h('div', { class: 'row-card__text' },
        h('span', { class: 'faceid-device__name' }, device.label),
        h('span', { class: 'faceid-device__meta' }, `Activado: ${when(device.created_at)}`),
        h('span', { class: 'faceid-device__meta' }, `Último uso: ${when(device.last_used_at)}`)),
      remove);
  };

  // Con algún móvil ya activado, el formulario queda oculto hasta pulsar «Añadir otro móvil» (o volver a activar este).
  const form = h('div', { class: 'stack' }, label, enable);
  const another = h('button', { class: 'btn btn--outline btn--block', type: 'button' }, 'Añadir otro móvil');
  const hasDevices = devices.length > 0;
  if (hasDevices) {
    form.hidden = true;
    another.addEventListener('click', () => { form.hidden = false; another.hidden = true; label.focus(); });
  }

  return h('main', { class: 'screen' }, header,
    h('div', { class: 'screen__body' },
      h('p', { class: 'lead' }, 'Tu cara nunca sale del iPhone: la app solo guarda una clave que no sirve sin Face ID.'),
      h('div', { class: 'stack' }, hasDevices ? devices.map(row) : h('p', { class: 'lead' }, 'Todavía no hay ningún móvil con Face ID.')),
      hasDevices ? another : null, form, error));
}
