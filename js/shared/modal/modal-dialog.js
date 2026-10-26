import { h } from '../../core/dom.js';
import { icon } from '../icons.js';
import { MODAL_KINDS } from './modal-kinds.js';

let current = null;

function closeCurrent(value) {
  if (current) current.close(value);
}

/**
 * Abre una ventana modal y devuelve una promesa con el valor del botón pulsado.
 * actions: [{ label, value, style: 'primary' | 'outline' | 'bad' }]
 * dismissValue: lo que devuelve si se cierra con Esc o tocando fuera.
 * initialFocus: posición del botón que recibe el foco (por defecto, el primero).
 */
export function openModal({ kind = 'info', title, message, actions, dismissValue, initialFocus = 0 }) {
  closeCurrent(dismissValue);

  return new Promise((resolve) => {
    const previousFocus = document.activeElement;
    const buttons = actions.map((action) =>
      h('button', { class: `btn btn--block btn--${action.style || 'primary'}`, type: 'button', onClick: () => close(action.value) }, action.label),
    );

    const dialog = h(
      'div',
      { class: `modal modal--${kind}`, role: kind === 'error' ? 'alertdialog' : 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'modal-title' },
      h('span', { class: 'modal__icon' }, icon(MODAL_KINDS[kind].icon, 34)),
      h('h2', { class: 'modal__title', id: 'modal-title' }, title),
      message ? h('p', { class: 'modal__text' }, message) : null,
      h('div', { class: 'modal__actions' }, buttons),
    );
    const overlay = h('div', { class: 'modal-overlay' }, dialog);

    function onKey(event) {
      if (event.key === 'Escape') close(dismissValue);
    }

    function close(value) {
      if (current?.overlay !== overlay) return;
      current = null;
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
      overlay.remove();
      if (previousFocus && previousFocus.focus) previousFocus.focus();
      resolve(value);
    }

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close(dismissValue);
    });
    document.addEventListener('keydown', onKey);

    current = { overlay, close };
    document.body.classList.add('modal-open');
    document.body.append(overlay);
    buttons[initialFocus]?.focus();
  });
}
