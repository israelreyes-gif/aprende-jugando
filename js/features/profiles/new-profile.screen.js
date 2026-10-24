import { h } from '../../core/dom.js';
import { go } from '../../core/router.js';
import { paths } from '../../core/paths.js';
import { appHeader } from '../../shared/app-header.js';
import { newProfileForm } from './new-profile-form.js';

/** Pantalla para crear un perfil nuevo. */
export async function newProfileScreen() {
  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: 'Nuevo perfil', sub: 'Elige nombre y color', back: paths.home(), shield: true }),
    h('div', { class: 'screen__body' }, newProfileForm({ onCreated: () => go(paths.home()) })),
  );
}
