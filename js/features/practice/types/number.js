import { textInputRender } from './text-input.js';

// Pregunta numérica: { id, type: 'number', prompt, answer: 56, explain }
export const number = {
  render: textInputRender({
    inputmode: 'decimal',
    parse: (raw) => (raw.trim() === '' ? null : Number(raw.trim().replace(',', '.'))),
  }),
  check: (q, value) => typeof value === 'number' && Math.abs(value - q.answer) < 1e-9,
  answerText: (q) => String(q.answer).replace('.', ','),
  givenText: (q, value) => (value == null ? '' : String(value)),
};
