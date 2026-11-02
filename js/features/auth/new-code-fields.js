import { h } from '../../core/dom.js';
import { codeInput } from './code-input.js';
import { codeProblem, minDigits } from './code-rules.js';
import { strengthBar } from './strength-bar.js';

/**
 * Dos campos para crear un código (se escribe dos veces) con su barra de fuerza.
 * optional: se puede dejar vacío. read() devuelve { code, error }: code '' si está vacío y es opcional.
 */
export function newCodeFields({ owner, prefix = 'code', optional = false, label = 'Código nuevo' }) {
  const bar = strengthBar();
  const first = codeInput(`${prefix}-new`, { onInput: (value) => bar.update(value) });
  const second = codeInput(`${prefix}-repeat`);
  const hint = `${minDigits(owner)} a 8 números${optional ? ' (puedes dejarlo vacío y crearlo al entrar)' : ''}`;

  const el = h(
    'div',
    { class: 'stack', style: { '--gap': '14px' } },
    h('div', { class: 'field' }, h('label', { class: 'field__label', for: first.id }, label), first, bar, h('p', { class: 'field__hint' }, hint)),
    h('div', { class: 'field' }, h('label', { class: 'field__label', for: second.id }, 'Repítelo'), second),
  );

  el.read = () => {
    if (optional && !first.value && !second.value) return { code: '', error: '' };
    const problem = codeProblem(first.value, owner);
    if (problem) return { code: '', error: problem };
    if (first.value !== second.value) return { code: '', error: 'Los dos códigos no coinciden.' };
    return { code: first.value, error: '' };
  };
  el.focus = () => first.focus();
  return el;
}
