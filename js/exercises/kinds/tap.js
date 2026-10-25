import { h } from '../../core/dom.js';
import { visualNode } from '../visual.js';

// Tocar las figuras que cumplen algo: { id, type: 'tap', prompt, items: [{ visual: '<svg…>', label: 'cuadrado', correct: true }], explain }
// Hay que tocar todas las correctas y ninguna incorrecta.
export const tap = {
  render(q, { onChange }) {
    const selected = new Set();
    let locked = false;

    const buttons = q.items.map((item, i) =>
      h('button', {
        class: 'tap-item', type: 'button', 'aria-pressed': 'false', 'aria-label': item.label,
        onClick: () => {
          if (locked) return;
          if (selected.has(i)) selected.delete(i);
          else selected.add(i);
          buttons[i].setAttribute('aria-pressed', String(selected.has(i)));
          onChange(selected.size ? [...selected].sort((a, b) => a - b) : null);
        },
      }, visualNode(item.visual)));

    return {
      el: h('div', { class: 'tap-grid', role: 'group', 'aria-label': q.prompt }, buttons),
      focus: () => {},
      lock: () => {
        locked = true;
        buttons.forEach((button) => (button.disabled = true));
      },
      reveal: () =>
        buttons.forEach((button, i) => {
          const item = q.items[i];
          if (item.correct) button.classList.add(selected.has(i) ? 'tap-item--correct' : 'tap-item--missed');
          else if (selected.has(i)) button.classList.add('tap-item--wrong');
        }),
    };
  },
  check: (q, value) => Array.isArray(value) && q.items.every((item, i) => item.correct === value.includes(i)),
  answerText: (q) => q.items.filter((item) => item.correct).map((item) => item.label).join(', '),
  givenText: (q, value) => (value ? value.map((i) => q.items[i].label).join(', ') : ''),
};
