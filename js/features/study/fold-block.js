import { h } from '../../core/dom.js';

/** Sección plegable de la lección: título con el número de líneas; al tocarlo se despliega la lista. */
export function foldBlock({ fold, list }, listen) {
  return h(
    'details',
    { class: 'fold' },
    h('summary', { class: 'fold__title' }, fold, h('span', { class: 'fold__count' }, String(list.length))),
    h('ul', { class: 'lesson__list' }, list.map((item) => h('li', {}, item, listen(item)))),
  );
}
