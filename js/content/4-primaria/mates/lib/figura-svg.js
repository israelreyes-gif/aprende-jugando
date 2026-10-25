/** Dibujo SVG de una figura. big: tamaño grande, alineado a la izquierda (para ponerlo en el enunciado). */
export function figuraSvg(figura, big = false) {
  return `<svg class="fig${big ? ' fig--big' : ''}" viewBox="0 0 100 100" aria-hidden="true">${figura.d}</svg>`;
}
