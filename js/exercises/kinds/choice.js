import { h } from '../../core/dom.js';
import { shuffle } from '../../core/random.js';

// Pregunta de elección: { id, type: 'choice', prompt, options: [...], answer: índice, explain }
export const choice = {
  render(q, { onChange }) {
    const options = shuffle(q.options.map((label, index) => ({ label, index })));
    const buttons = options.map((option) =>
      h('button', { class: 'option', type: 'button', role: 'radio', 'aria-checked': 'false', onClick: () => {
        buttons.forEach((b) => b.setAttribute('aria-checked', String(b === buttons[options.indexOf(option)])));
        onChange(option.index);
      } }, option.label),
    );
    const group = h('div', { class: 'options', role: 'radiogroup', 'aria-label': q.prompt }, buttons);

    return {
      el: group,
      focus: () => {},
      lock: () => buttons.forEach((b) => (b.disabled = true)),
      reveal: (isCorrect, value) => {
        options.forEach((option, i) => {
          if (option.index === q.answer) buttons[i].classList.add('option--correct');
          else if (!isCorrect && option.index === value) buttons[i].classList.add('option--wrong');
        });
      },
    };
  },
  check: (q, value) => value === q.answer,
  answerText: (q) => q.options[q.answer],
  givenText: (q, value) => (value == null ? '' : q.options[value]),
};
