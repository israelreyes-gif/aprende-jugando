import { norm } from '../../shared/text-normalize.js';
import { textInputRender } from './text-input.js';

// Pregunta de texto: { id, type: 'text', prompt, answers: ['valida1', 'valida2'], explain }
// Se ignoran mayúsculas, tildes y signos al comparar.
export const text = {
  render: textInputRender({ inputmode: 'text', parse: (raw) => (raw.trim() === '' ? null : raw) }),
  check: (q, value) => value != null && q.answers.some((accepted) => norm(accepted) === norm(value)),
  answerText: (q) => q.answers[0],
  givenText: (q, value) => (value == null ? '' : String(value)),
};
