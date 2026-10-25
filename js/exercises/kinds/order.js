import { h } from '../../core/dom.js';
import { shuffle } from '../../core/random.js';

// Ordenar tocando: { id, type: 'order', prompt, answer: ['12.345', '56.789', '98.765'], explain }
// answer es la lista en el orden correcto (textos distintos entre sí). Tocar un elemento le da su número de orden.
export const order = {
  render(q, { onChange }) {
    const labels = shuffle(q.answer);
    let tapped = [];
    let locked = false;

    const badges = labels.map(() => h('span', { class: 'order__badge', hidden: true }));
    const buttons = labels.map((label, i) =>
      h('button', { class: 'order__item', type: 'button', 'aria-pressed': 'false', onClick: () => toggle(label) }, label, badges[i]));

    function paint() {
      buttons.forEach((button, i) => {
        const pos = tapped.indexOf(labels[i]);
        button.setAttribute('aria-pressed', String(pos >= 0));
        badges[i].hidden = pos < 0;
        badges[i].textContent = pos + 1;
      });
      onChange(tapped.length === labels.length ? tapped.slice() : null);
    }
    function toggle(label) {
      if (locked) return;
      tapped = tapped.includes(label) ? tapped.filter((x) => x !== label) : [...tapped, label];
      paint();
    }

    return {
      el: h('div', { class: 'order', role: 'group', 'aria-label': q.prompt }, buttons),
      focus: () => {},
      lock: () => {
        locked = true;
        buttons.forEach((button) => (button.disabled = true));
      },
      reveal: (isCorrect, value) =>
        buttons.forEach((button, i) => {
          const right = q.answer.indexOf(labels[i]);
          badges[i].hidden = false;
          badges[i].textContent = right + 1;
          button.classList.add(value && value[right] === labels[i] ? 'order__item--correct' : 'order__item--wrong');
        }),
    };
  },
  check: (q, value) => Array.isArray(value) && value.join('|') === q.answer.join('|'),
  answerText: (q) => q.answer.join(' → '),
  givenText: (q, value) => (value ? value.join(' → ') : ''),
};
