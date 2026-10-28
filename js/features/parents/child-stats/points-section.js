import { h } from '../../../core/dom.js';
import { formatNumber, signed } from '../../points/format-points.js';
import { periodPoints } from '../../points/period-points.js';
import { levelCard } from '../../points/ui/level-card.js';
import { pointsLines } from '../../points/ui/points-lines.js';
import { pointsDays } from './points-days.js';

const chip = (value, label) => h('div', { class: 'stat-chip' }, h('span', { class: 'stat-chip__value' }, value), h('span', { class: 'stat-chip__label' }, label));

/**
 * Puntos de un perfil para la zona de padres: nivel, hoy / semana, de dónde vienen y gráfica de 7 días.
 * points: lo que devuelve loadPoints(). today: 'AAAA-MM-DD'.
 */
export function pointsSection(points, today) {
  const period = periodPoints(points.byDay, today);
  const lines = [
    { label: '✅ Aciertos', value: signed(points.right), tone: 'pos' },
    { label: '❌ Fallos', value: signed(-points.wrong), tone: points.wrong ? 'neg' : null },
    { label: '⭐ Bonus de sesiones', value: signed(points.bonus), tone: points.bonus > 0 ? 'pos' : points.bonus < 0 ? 'neg' : null },
    { label: `📚 Temas estudiados (${points.studied})`, value: signed(points.studiedPts), tone: 'pos' },
    { label: 'Total', value: formatNumber(points.total), tone: 'total' },
  ];
  return h(
    'section',
    { class: 'stack' },
    h('h2', { class: 'title-lg' }, 'Puntos'),
    levelCard({ points }),
    h('div', { class: 'grid-2' }, chip(signed(period.today), 'Hoy'), chip(signed(period.week), 'Esta semana')),
    h('div', { class: 'points-card' }, h('p', { class: 'points-card__title' }, '¿De dónde vienen?'), pointsLines(lines)),
    pointsDays(period.days),
  );
}
