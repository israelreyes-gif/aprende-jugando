import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { avatar } from '../../shared/avatar.js';
import { icon } from '../../shared/icons.js';
import { profileLevelChip } from './profile-level-chip.js';

/** Tarjeta de un perfil con su color y su nivel: entra al perfil, y un lápiz en la esquina abre su edición. points: sus puntos (si se pudieron leer). */
export function profileCard(profile, points) {
  return h(
    'div',
    { class: 'profile-item' },
    h(
      'a',
      { class: 'card profile-card', href: paths.courses(profile.id), style: { '--pc': profile.avatar_color }, 'aria-label': `Entrar como ${profile.name}` },
      avatar(profile, 'lg'),
      h('span', { class: 'profile-card__name' }, profile.name),
      profileLevelChip(points, profile.gender),
    ),
    h('a', { class: 'profile-edit', href: paths.editProfile(profile.id), 'aria-label': `Editar el perfil de ${profile.name}` }, icon('edit', 20)),
  );
}

export function addProfileCard() {
  return h(
    'a',
    { class: 'card profile-card profile-card--add', href: paths.newProfile(), 'aria-label': 'Añadir un perfil nuevo' },
    h('span', { class: 'avatar avatar--lg' }, icon('plus', 36)),
    h('span', { class: 'profile-card__name' }, 'Añadir perfil'),
  );
}
