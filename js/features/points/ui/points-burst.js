import { h } from '../../../core/dom.js';
import { mascotSrc } from '../../../shared/mascot.js';
import { formatNumber, signed } from '../format-points.js';
import { pointsLines } from './points-lines.js';

const TEXTS = {
  up: { title: '¡puntos para ti!', bubble: '¡Qué máquina! 💪 Cada acierto suma.' },
  down: { title: 'puntos esta vez', bubble: '¡Casi! 🌱 Fallar también enseña. Repasa la teoría y recupéralos.' },
  even: { title: 'puntos esta vez', bubble: '¡Vas por buen camino! 🌱 Otra vez y sumas.' },
};

/**
 * Bloque de puntos de una sesión (ejercicios o reto): mochila, cifra grande, mensaje y desglose.
 * result: lo que devuelve sessionPoints(). Devuelve { node, setTotal(total) }: el total se rellena cuando se conoce.
 */
export function pointsBurst({ result }) {
  const tone = result.total > 0 ? 'up' : result.total < 0 ? 'down' : 'even';
  const lines = [
    { label: `${result.right} ${result.right === 1 ? 'acierto' : 'aciertos'}`, value: signed(result.right), tone: 'pos' },
    { label: `${result.wrong} ${result.wrong === 1 ? 'fallo' : 'fallos'}`, value: signed(-result.wrong), tone: result.wrong ? 'neg' : null },
  ];
  if (result.bonus) lines.push({ label: '⭐ Bonus', value: signed(result.bonus), tone: result.bonus > 0 ? 'pos' : 'neg' });

  const lines$ = pointsLines(lines);
  const totalValue = h('span', { class: 'points-line__value' }, '…');
  lines$.append(h('div', { class: 'points-line points-line--total' }, h('span', {}, 'Total ahora'), totalValue));

  const node = h(
    'section',
    { class: `points-burst points-burst--${tone}`, 'aria-label': 'Puntos de esta sesión' },
    h('img', { class: 'points-burst__mascot', src: mascotSrc(), alt: '', width: 96, height: 96 }),
    h('p', { class: 'points-burst__number' }, signed(result.total)),
    h('p', { class: 'points-burst__title' }, TEXTS[tone].title),
    h('p', { class: 'points-burst__bubble' }, TEXTS[tone].bubble),
    lines$,
  );

  return { node, setTotal: (total) => (totalValue.textContent = `${formatNumber(total)} puntos`) };
}
