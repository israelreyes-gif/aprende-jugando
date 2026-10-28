import { h } from '../../../core/dom.js';
import { paths } from '../../../core/paths.js';
import { formatNumber } from '../format-points.js';
import { levelFor } from '../levels.js';
import { courseMeter } from './course-meter.js';

/** Tarjeta con el nivel, los puntos y lo que falta para el siguiente. Con profileId, al tocarla se abre la lista de niveles. gender: 'chico' | 'chica'. course: porcentaje del curso (opcional). */
export function levelCard({ points, profileId, gender, course }) {
  const level = levelFor(points.total, gender);
  const attrs = profileId ? { href: paths.levels(profileId), 'aria-label': `Nivel ${level.n}, ${level.name}. Ver todos los niveles` } : {};
  return h(
    profileId ? 'a' : 'div',
    { class: 'level-card', ...attrs },
    h('span', { class: 'level-card__emoji', 'aria-hidden': 'true' }, level.emoji),
    h('span', { class: 'level-card__tag' }, `NIVEL ${level.n}`),
    h('span', { class: 'level-card__name' }, level.name),
    h('span', { class: 'level-card__points' }, `${formatNumber(points.total)} puntos`),
    h('span', { class: 'level-card__bar', 'aria-hidden': 'true' }, h('i', { style: { width: `${level.progress}%` } })),
    h('span', { class: 'level-card__next' }, level.next ? `${formatNumber(level.toNext)} puntos más para ser ${level.next.name} ${level.next.emoji}` : '¡Has llegado al nivel más alto! 👑'),
    course ? courseMeter(course, { onCard: true }) : null,
  );
}
