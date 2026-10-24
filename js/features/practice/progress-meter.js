import { h } from '../../core/dom.js';

/** "Pregunta 2 de 8" con barra de progreso. */
export function progressMeter({ index, total, t }) {
  return h(
    'div',
    { class: 'practice__meter' },
    h('span', {}, t.question(index + 1, total)),
    h('div', { class: 'progress', 'aria-hidden': 'true' }, h('div', { class: 'progress__bar', style: { '--value': `${(index / total) * 100}%` } })),
  );
}
