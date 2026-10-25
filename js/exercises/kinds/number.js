import { fmt } from '../../shared/number-format.js';
import { toNum } from '../../shared/answer-parse.js';
import { textInputRender } from './text-input.js';

// Pregunta numérica: { id, type: 'number', prompt, answer: 56, explain, thousands?: true }
// Acepta "223.348" y "223348" (puntos de miles) y "3,5" (decimales con coma).
// thousands: true muestra la respuesta con puntos de miles (no usar en años).
export const number = {
  render: textInputRender({
    inputmode: 'decimal',
    parse: (raw) => {
      const n = toNum(raw);
      return Number.isNaN(n) ? null : n;
    },
  }),
  check: (q, value) => typeof value === 'number' && Math.abs(value - q.answer) < 1e-9,
  answerText: (q) => (q.thousands ? fmt(q.answer) : String(q.answer).replace('.', ',')),
  givenText: (q, value) => (value == null ? '' : String(value)),
};
