import { h } from '../../../core/dom.js';
import { icon } from '../../../shared/icons.js';
import { useShield } from './use-shield.js';

/**
 * Franja de protectores bajo la tarjeta del reto. status: lo que devuelve loadRetoStatus() (o null).
 * Solo sale si hay protectores; con días que proteger, ofrece gastar uno.
 */
export function shieldBar({ profile, status }) {
  const available = status?.shields?.available ?? 0;
  if (available < 1) return null;
  const missed = status.missed || [];
  const word = available === 1 ? 'protector de racha' : 'protectores de racha';
  return h(
    'div',
    { class: 'shield-bar' },
    h('span', { class: 'shield-bar__icon' }, icon('shield', 24)),
    h(
      'span',
      { class: 'shield-bar__text' },
      h('span', { class: 'shield-bar__title' }, `Tienes ${available} ${word}`),
      h('span', { class: 'shield-bar__sub' }, missed.length ? 'Puedes salvar un día que no hiciste el reto.' : 'Los usarás cuando se te escape un día.'),
    ),
    missed.length ? h('button', { class: 'btn btn--outline', type: 'button', onClick: () => useShield({ profile, missed }) }, 'Usar') : null,
  );
}
