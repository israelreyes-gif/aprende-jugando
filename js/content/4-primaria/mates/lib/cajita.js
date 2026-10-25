/** Cajita multiplicativa: arriba el producto, abajo los dos factores. Usa '?' para lo que falta. */
export function cajita(arriba, izquierda, derecha) {
  return `<div class="cajita"><div class="cajita__top">${arriba}</div><div class="cajita__bottom"><span>${izquierda}</span><span>${derecha}</span></div></div>`;
}
