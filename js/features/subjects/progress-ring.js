import { h } from '../../core/dom.js';

/** Anillo que se rellena según el porcentaje. Sin porcentaje, queda vacío con un ▶. */
export function progressRing(percent) {
  const has = percent != null;
  return h(
    'span',
    { class: 'topic-ring', style: { '--p': has ? percent : 0 }, role: 'img', 'aria-label': has ? `${percent} %` : '' },
    h('span', {}, has ? `${percent}%` : '▶'),
  );
}
