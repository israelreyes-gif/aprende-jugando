import { h } from '../../../core/dom.js';
import { signed } from '../../points/format-points.js';

const letter = (day) => new Date(`${day}T12:00:00Z`).toLocaleDateString('es-ES', { weekday: 'narrow', timeZone: 'UTC' }).toUpperCase();

/** Gráfica de barras con los puntos de los últimos 7 días (la barra de hoy, más fuerte). days: [{ day, points }] */
export function pointsDays(days) {
  const max = Math.max(1, ...days.map((d) => d.points));
  return h(
    'div',
    { class: 'points-days', role: 'img', 'aria-label': `Puntos de los últimos 7 días: ${days.map((d) => signed(d.points)).join(', ')}` },
    h('p', { class: 'points-days__title' }, 'Puntos por día (últimos 7)'),
    h(
      'div',
      { class: 'points-days__bars' },
      days.map((d, i) =>
        h(
          'div',
          { class: `points-days__col${i === days.length - 1 ? ' points-days__col--today' : ''}` },
          h('i', { style: { height: `${Math.max(0, d.points) === 0 ? 4 : Math.round((Math.max(0, d.points) * 100) / max)}%` } }),
          h('span', {}, letter(d.day)),
        ),
      ),
    ),
  );
}
