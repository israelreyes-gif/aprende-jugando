import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { avatar } from '../../shared/avatar.js';
import { icon } from '../../shared/icons.js';

/** Fila de un perfil en la lista de la zona de padres. */
export function profileRow(profile) {
  return h(
    'a',
    { class: 'card row-card', href: paths.childStats(profile.id), 'aria-label': `Ver estadísticas de ${profile.name}` },
    avatar(profile, 'md'),
    h('span', { class: 'row-card__text' }, h('span', { class: 'row-card__title' }, profile.name), h('span', { class: 'muted', style: { fontWeight: '700', fontSize: '14px' } }, 'Ver estadísticas')),
    h('span', { class: 'row-card__chev' }, icon('chevron')),
  );
}
