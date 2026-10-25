import { h } from '../../core/dom.js';
import { shuffle } from '../../core/random.js';

// Construir una frase con fichas: { id, type: 'words', prompt, answer: ['ochenta', 'y', 'ocho', 'mil'], extra?: ['quince'], explain }
// extra son fichas de más para confundir. Tocar una ficha la añade; tocarla en la línea la quita.
export const words = {
  render(q, { onChange }) {
    const chips = shuffle([...q.answer, ...(q.extra || [])].map((word, id) => ({ word, id })));
    let picked = [];
    let locked = false;

    const line = h('div', { class: 'word-line', 'aria-label': q.prompt, 'aria-live': 'polite' });
    const poolButtons = chips.map((chip) =>
      h('button', { class: 'word', type: 'button', onClick: () => pick(chip.id) }, chip.word));
    const pool = h('div', { class: 'word-pool' }, poolButtons);
    const wordOf = (id) => chips.find((chip) => chip.id === id).word;

    function paint() {
      line.replaceChildren(...picked.map((id) =>
        h('button', { class: 'word word--in', type: 'button', disabled: locked, onClick: () => drop(id) }, wordOf(id))));
      poolButtons.forEach((button, i) => {
        const used = picked.includes(chips[i].id);
        button.disabled = used || locked;
        button.classList.toggle('word--used', used);
      });
      onChange(picked.length ? picked.map(wordOf) : null);
    }
    function pick(id) {
      if (locked) return;
      picked = [...picked, id];
      paint();
    }
    function drop(id) {
      if (locked) return;
      picked = picked.filter((x) => x !== id);
      paint();
    }

    paint();
    return {
      el: h('div', { class: 'words' }, line, pool),
      focus: () => {},
      lock: () => {
        locked = true;
        paint();
      },
      reveal: (isCorrect) => line.classList.add(isCorrect ? 'word-line--correct' : 'word-line--wrong'),
    };
  },
  check: (q, value) => Array.isArray(value) && value.join(' ') === q.answer.join(' '),
  answerText: (q) => q.answer.join(' '),
  givenText: (q, value) => (value ? value.join(' ') : ''),
};
