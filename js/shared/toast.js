import { h } from '../core/dom.js';

let el = null;
let timer = null;

/** Muestra un aviso breve en la parte inferior de la pantalla. */
export function toast(message, ms = 2400) {
  if (!el) {
    el = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
    document.body.append(el);
  }
  el.textContent = message;
  el.classList.add('toast--visible');
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove('toast--visible'), ms);
}
