import { isHalloween } from './seasons.js';

/** Ruta del dibujo de la mochila: la de Halloween en sus fechas y la normal el resto del año. */
export function mascotSrc(date = new Date()) {
  return isHalloween(date) ? 'icons/mochila-halloween.svg' : 'icons/mochila.svg';
}
