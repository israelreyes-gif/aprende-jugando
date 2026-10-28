import { h } from '../../../core/dom.js';

/** Filas "texto ....... valor". lines: [{ label, value, tone?: 'pos' | 'neg' | 'total' }] */
export function pointsLines(lines) {
  return h(
    'div',
    { class: 'points-lines' },
    lines.map((line) => h('div', { class: `points-line${line.tone ? ` points-line--${line.tone}` : ''}` }, h('span', {}, line.label), h('span', { class: 'points-line__value' }, line.value))),
  );
}
