import { h } from '../../core/dom.js';
import { toNum } from '../../shared/answer-parse.js';

const PARSERS = {
  number: (raw) => {
    const n = toNum(raw);
    return Number.isNaN(n) ? null : n;
  },
  text: (raw) => (raw.trim() === '' ? null : raw.trim()),
};

/**
 * Varios campos de respuesta, cada uno con su etiqueta: q.fields = [{ label, kind? }].
 * kindOf(field) -> 'number' | 'text'.
 * judge(q, values, i) -> true/false para marcar cada campo; sin judge se marcan todos según el resultado.
 * onChange recibe la lista de valores, o null mientras falte alguno.
 */
export function fieldsRender({ kindOf, judge }) {
  return (q, { t, onChange, onSubmit }) => {
    const values = q.fields.map(() => null);
    const inputs = q.fields.map((field, i) => {
      const kind = kindOf(field);
      return h('input', {
        class: 'input', type: 'text', inputmode: kind === 'number' ? 'decimal' : 'text',
        autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
        placeholder: t.yourAnswer, 'aria-label': field.label,
        onInput: (event) => {
          values[i] = PARSERS[kind](event.target.value);
          onChange(values.every((v) => v !== null) ? values.slice() : null);
        },
        onKeydown: (event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          if (i === q.fields.length - 1) onSubmit();
          else inputs[i + 1].focus();
        },
      });
    });
    const el = h('div', { class: 'fields' }, q.fields.map((field, i) =>
      h('label', { class: 'field' }, h('span', { class: 'field__label' }, field.label), inputs[i])));

    return {
      el,
      focus: () => inputs[0].focus(),
      lock: () => inputs.forEach((input) => (input.disabled = true)),
      reveal: (isCorrect, value) =>
        inputs.forEach((input, i) => {
          const good = judge ? judge(q, value, i) : isCorrect;
          input.classList.add(good ? 'input--correct' : 'input--wrong');
        }),
    };
  };
}
