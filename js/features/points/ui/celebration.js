import { h } from '../../../core/dom.js';
import { confettiSet } from './confetti-set.js';
import { pointsLines } from './points-lines.js';

/**
 * Pantalla completa de celebración (tema estudiado, subida de nivel). Devuelve una promesa que se cumple al cerrarla.
 * theme: 'gold' | 'level'. art: nodo con la imagen. eyebrow, big, title, bubble, lines, button: textos.
 */
export function showCelebration({ theme = 'gold', art, eyebrow, big, title, bubble, lines = [], button = '¡Genial!' }) {
  return new Promise((resolve) => {
    const previousFocus = document.activeElement;
    const close = () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
      overlay.remove();
      if (previousFocus && previousFocus.focus) previousFocus.focus();
      resolve();
    };
    const onKey = (event) => {
      if (event.key === 'Escape') close();
    };

    const action = h('button', { class: 'btn btn--block btn--primary celebration__button', type: 'button', onClick: close }, button);
    const overlay = h(
      'div',
      { class: `celebration celebration--${theme}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('div', { class: 'celebration__confetti', 'aria-hidden': 'true' }, confettiSet().map((emoji, i) => h('span', { class: `confetti confetti--${i + 1}` }, emoji))),
      h(
        'div',
        { class: 'celebration__body' },
        eyebrow ? h('p', { class: 'celebration__eyebrow' }, eyebrow) : null,
        art,
        h('p', { class: 'celebration__big' }, big),
        h('p', { class: 'celebration__title' }, title),
        bubble ? h('p', { class: 'celebration__bubble' }, bubble) : null,
        lines.length ? pointsLines(lines) : null,
        action,
      ),
    );

    document.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');
    document.body.append(overlay);
    action.focus();
  });
}
