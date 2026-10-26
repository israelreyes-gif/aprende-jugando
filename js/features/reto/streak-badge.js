import { h } from '../../core/dom.js';

/** Cifra de la racha con la palabra "día(s)". */
export function streakBadge(days) {
  const word = days === 1 ? 'día' : 'días';
  return h('span', { class: 'streak', 'aria-label': `Racha de ${days} ${word}` }, h('b', {}, String(days)), h('span', {}, word));
}
