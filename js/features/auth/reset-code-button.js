import { h } from '../../core/dom.js';
import { resetCode } from '../../data/auth.repo.js';
import { icon } from '../../shared/icons.js';
import { confirmDialog, notify } from '../../shared/modal.js';

/** Botón de padres para quitar el código de un perfil: la próxima vez que entre tendrá que crear uno nuevo. */
export function resetCodeButton(profile) {
  return h('button', {
    class: 'btn btn--outline btn--block', type: 'button',
    onClick: async () => {
      const yes = await confirmDialog({ title: `¿Restablecer el código de ${profile.name}?`, message: 'Se cerrará su sesión en todos los móviles y tendrá que crear un código nuevo la próxima vez que entre.', confirm: 'Restablecer' });
      if (!yes) return;
      try {
        await resetCode(profile.id);
        await notify({ kind: 'success', title: 'Código restablecido', message: `${profile.name} creará uno nuevo al entrar.` });
      } catch (err) {
        console.error(err);
        notify({ kind: 'error', title: 'No se ha podido restablecer', message: 'Inténtalo de nuevo.' });
      }
    },
  }, icon('lock', 22), 'Restablecer su código');
}
