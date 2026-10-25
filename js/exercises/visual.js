import { h } from '../core/dom.js';

/** Convierte un trozo de marcado (por ejemplo un dibujo SVG) en un nodo. Solo para contenido propio de la app. */
export function visualNode(markup) {
  const el = h('span', { class: 'visual' });
  el.innerHTML = markup;
  return el;
}
