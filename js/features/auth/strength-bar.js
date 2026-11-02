import { h } from '../../core/dom.js';
import { codeStrength } from './code-rules.js';

/** Barra de fuerza del código. update(código) la repinta. */
export function strengthBar() {
  const fill = h('span', { class: 'strength__fill' });
  const text = h('span', { class: 'strength__text' });
  const el = h('div', { class: 'strength', 'data-level': '0', 'aria-live': 'polite' }, h('span', { class: 'strength__track' }, fill), text);
  el.update = (code) => {
    const { level, label } = codeStrength(code);
    el.dataset.level = String(level);
    text.textContent = label ? `Fuerza: ${label}` : '';
  };
  return el;
}
