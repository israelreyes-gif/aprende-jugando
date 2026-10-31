import { isHalloween, isChristmas } from './seasons.js';

/** Ruta del dibujo de la mochila: la de Halloween o la de Navidad en sus fechas y la normal el resto del año. */
export function mascotSrc(date = new Date()) {
  if (isHalloween(date)) return 'icons/mochila-halloween.svg';
  if (isChristmas(date)) return 'icons/mochila-navidad.svg';
  return 'icons/mochila.svg';
}
