import { h } from '../core/dom.js';

export function loadingView() {
  return h(
    'div',
    { class: 'state', role: 'status' },
    h('div', { class: 'spinner', 'aria-hidden': 'true' }),
    h('p', { class: 'state__text' }, 'Cargando…'),
  );
}
