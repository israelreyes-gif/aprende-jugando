import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { avatar } from '../../shared/avatar.js';
import { icon } from '../../shared/icons.js';
import { formatNumber } from '../points/format-points.js';
import { levelFor } from '../points/levels.js';

/** Fila de un perfil en la lista de la zona de padres, con sus puntos y su nivel (si se pudieron leer). */
export function profileRow(profile, points) {
  const level = points ? levelFor(points.total) : null;
  return h(
    'a',
    { class: 'card row-card', href: paths.childStats(profile.id), 'aria-label': `Ver estadísticas de ${profile.name}` },
    avatar(profile, 'md'),
    h('span', { class: 'row-card__text' }, h('span', { class: 'row-card__title' }, profile.name), h('span', { class: 'muted', style: { fontWeight: '700', fontSize: '14px' } }, 'Ver estadísticas')),
    level ? h('span', { class: 'row-card__points' }, h('b', {}, formatNumber(points.total)), h('span', {}, `${level.emoji} Nivel ${level.n}`)) : null,
    h('span', { class: 'row-card__chev' }, icon('chevron')),
  );
}
