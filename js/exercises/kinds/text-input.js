import { h } from '../../core/dom.js';

/** Campo de texto común a las preguntas de respuesta escrita (número y texto). */
export function textInputRender({ inputmode, parse }) {
  return (q, { t, onChange, onSubmit }) => {
    const input = h('input', {
      class: 'input', type: 'text', inputmode, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
      placeholder: t.yourAnswer, 'aria-label': q.prompt,
      onInput: () => onChange(parse(input.value)),
      onKeydown: (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          onSubmit();
        }
      },
    });
    return {
      el: input,
      focus: () => input.focus(),
      lock: () => (input.disabled = true),
      reveal: (isCorrect) => input.classList.add(isCorrect ? 'input--correct' : 'input--wrong'),
    };
  };
}
