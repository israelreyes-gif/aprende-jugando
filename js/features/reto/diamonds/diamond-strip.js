import { h } from '../../../core/dom.js';
import { diamondSlots } from '../../../shared/diamond.js';

/**
 * Franja de diamantes dentro de la tarjeta del reto: ranuras (llenas y vacías), cuándo llega el siguiente y barra de progreso.
 * diamonds: { available, max, nextAt, ratio } de loadRetoStatus().
 */
export function diamondStrip(diamonds) {
  const full = diamonds.available >= diamonds.max;
  const count = `${diamonds.available} de ${diamonds.max} diamantes`;
  return h(
    'div',
    { class: 'diamond-strip', role: 'group', 'aria-label': count },
    h('div', { class: 'diamond-strip__top' }, h('span', { class: 'diamond-strip__slots' }, ...diamondSlots({ filled: diamonds.available, max: diamonds.max, width: 24 })), h('span', { class: 'diamond-strip__text' }, full ? 'Tienes el máximo de diamantes' : `Siguiente diamante en la racha ${diamonds.nextAt}`)),
    full ? null : h('div', { class: 'diamond-strip__bar', 'aria-hidden': 'true' }, h('i', { style: { width: `${Math.round(diamonds.ratio * 100)}%` } })),
  );
}
