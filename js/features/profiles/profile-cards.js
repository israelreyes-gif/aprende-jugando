import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { avatar } from '../../shared/avatar.js';
import { icon } from '../../shared/icons.js';

/** Tarjeta de un perfil: entra al perfil, y un lápiz en la esquina abre su edición. */
export function profileCard(profile) {
  return h(
    'div',
    { class: 'profile-item' },
    h(
      'a',
      { class: 'card profile-card', href: paths.courses(profile.id), 'aria-label': `Entrar como ${profile.name}` },
      avatar(profile, 'lg'),
      h('span', { class: 'profile-card__name' }, profile.name),
    ),
    h('a', { class: 'profile-edit', href: paths.editProfile(profile.id), 'aria-label': `Editar el perfil de ${profile.name}` }, icon('edit', 20)),
  );
}

export function addProfileCard() {
  return h(
    'a',
    { class: 'card profile-card profile-card--add', href: paths.newProfile(), 'aria-label': 'Añadir un perfil nuevo' },
    h('span', { class: 'avatar avatar--lg' }, icon('plus', 36)),
    h('span', { class: 'profile-card__name' }, 'Añadir'),
  );
}
