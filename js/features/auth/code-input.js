import { h } from '../../core/dom.js';
import { MAX_DIGITS } from './code-rules.js';

/** Campo de código numérico (solo cifras, hasta 8). */
export function codeInput(id, { onInput } = {}) {
  const input = h('input', {
    class: 'input', id, type: 'password', inputmode: 'numeric', autocomplete: 'off',
    maxlength: MAX_DIGITS, pattern: '[0-9]*', placeholder: '••••',
  });
  input.addEventListener('input', () => {
    const clean = input.value.replace(/\D/g, '').slice(0, MAX_DIGITS);
    if (clean !== input.value) input.value = clean;
    if (onInput) onInput(input.value);
  });
  return input;
}
