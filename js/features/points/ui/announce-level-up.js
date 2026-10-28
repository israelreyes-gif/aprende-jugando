import { h } from '../../../core/dom.js';
import { notifyParents } from '../../push/parent-alerts/notify-parents.js';
import { levelUpMessage } from '../../push/parent-alerts/parent-messages.js';
import { formatNumber } from '../format-points.js';
import { showCelebration } from './celebration.js';

/** Pantalla de "¡Nuevo nivel!" y aviso a los padres. */
export function announceLevelUp({ profile, level }) {
  notifyParents(levelUpMessage({ name: profile.name, level }));
  return showCelebration({
    theme: 'level',
    eyebrow: '¡NUEVO NIVEL!',
    art: h('span', { class: 'celebration__emoji', 'aria-hidden': 'true' }, level.emoji),
    big: `Nivel ${level.n}`,
    title: level.name,
    bubble: `¡Has llegado a ${formatNumber(level.min)} puntos! ¡Sigue así! 🚀`,
  });
}
