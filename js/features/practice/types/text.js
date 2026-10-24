import { textInputRender } from './text-input.js';

const normalize = (text) => String(text).trim().toLowerCase().replace(/\s+/g, ' ');

// Pregunta de texto: { id, type: 'text', prompt, answers: ['valida1', 'valida2'], explain }
export const text = {
  render: textInputRender({ inputmode: 'text', parse: (raw) => (raw.trim() === '' ? null : raw) }),
  check: (q, value) => value != null && q.answers.some((accepted) => normalize(accepted) === normalize(value)),
  answerText: (q) => q.answers[0],
  givenText: (q, value) => (value == null ? '' : String(value)),
};
