import { h } from '../../core/dom.js';

// Una lección es una lista de bloques. Cada bloque es un objeto con UNA clave:
//   { h: 'Título de sección' }
//   { p: 'Párrafo de texto' }
//   { list: ['punto 1', 'punto 2'] }
//   { tip: 'Truco o ejemplo destacado', label: 'Truco' }   (label es opcional)
export function renderBlocks(blocks) {
  return blocks.map((block) => {
    if (block.h) return h('h2', { class: 'lesson__h' }, block.h);
    if (block.p) return h('p', { class: 'lesson__p' }, block.p);
    if (block.list) return h('ul', { class: 'lesson__list' }, block.list.map((item) => h('li', {}, item)));
    if (block.tip) return h('div', { class: 'lesson__tip' }, block.label ? h('strong', {}, `${block.label}: `) : null, block.tip);
    return null;
  });
}
