import { h } from '../../core/dom.js';
import { icon } from '../../shared/icons.js';
import { hasLocalPasskey, passkeysSupported } from '../../core/webauthn/support.js';
import { loginWithPasskey } from '../../data/passkey.repo.js';

/** Botón «Entrar con Face ID» del acceso de padres (solo si se activó en este móvil). onDone() se llama al entrar. */
export function faceIdButton({ onDone }) {
  if (!passkeysSupported() || !hasLocalPasskey()) return null;
  const error = h('p', { class: 'field__error', role: 'alert' });
  const button = h('button', { class: 'btn btn--outline btn--block', type: 'button' }, icon('lock', 22), 'Entrar con Face ID');
  button.addEventListener('click', async () => {
    error.textContent = '';
    button.disabled = true;
    try {
      await loginWithPasskey();
      onDone();
    } catch (err) {
      // Cancelar el Face ID no es un error: se queda en el código.
      if (err?.name !== 'NotAllowedError') error.textContent = 'No se ha podido entrar con Face ID. Usa el código.';
      button.disabled = false;
    }
  });
  return h('div', { class: 'stack' }, button, error);
}
