import { h } from '../../core/dom.js';
import { go } from '../../core/router.js';
import { paths } from '../../core/paths.js';
import { logout } from '../../data/auth.repo.js';
import { icon } from '../../shared/icons.js';
import { resetFlags } from './flags.js';

/** Botón para cerrar la sesión de un perfil (o de los padres) en este móvil. */
export function logoutButton(owner, label = 'Cerrar sesión en este móvil') {
  return h('button', {
    class: 'btn btn--outline btn--block', type: 'button',
    onClick: async () => {
      await logout(owner);
      resetFlags();
      go(paths.home());
    },
  }, icon('lock', 22), label);
}
