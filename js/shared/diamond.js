import { svg } from '../core/dom.js';

const FACETS = [
  ['1,10 6,2 11,10', '#B5D4F4'],
  ['6,2 16,2 11,10', '#E6F1FB'],
  ['16,2 21,10 11,10', '#85B7EB'],
  ['16,2 26,2 21,10', '#E6F1FB'],
  ['26,2 31,10 21,10', '#B5D4F4'],
  ['1,10 11,10 16,26', '#378ADD'],
  ['11,10 21,10 16,26', '#85B7EB'],
  ['21,10 31,10 16,26', '#185FA5'],
];
const OUTLINE = '6,2 26,2 31,10 16,26 1,10';

/** Diamante con facetas (lleno) o ranura vacía (contorno discontinuo). width: ancho en px; el alto sale proporcional. */
export function diamond({ filled = true, width = 28 } = {}) {
  const parts = filled
    ? [...FACETS.map(([points, fill]) => svg('polygon', { points, fill })), svg('polygon', { points: OUTLINE, fill: 'none', stroke: '#185FA5', 'stroke-width': 1, 'stroke-linejoin': 'round' })]
    : [svg('polygon', { points: OUTLINE, fill: 'none', stroke: '#B4B2A9', 'stroke-width': 1.5, 'stroke-dasharray': '3 2.5', 'stroke-linejoin': 'round' })];
  return svg('svg', { viewBox: '0 0 32 28', width, height: Math.round((width * 28) / 32), 'aria-hidden': 'true', class: filled ? 'diamond' : 'diamond diamond--empty' }, ...parts);
}

/** Fila de ranuras: `filled` diamantes llenos y el resto vacías, hasta `max`. */
export function diamondSlots({ filled, max, width = 26 }) {
  return Array.from({ length: max }, (_, i) => diamond({ filled: i < filled, width }));
}
