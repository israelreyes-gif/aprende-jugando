import { norm } from '../../shared/text-normalize.js';
import { stripArticle } from '../../shared/strip-article.js';
import { textInputRender } from './text-input.js';

// Pregunta de texto: { id, type: 'text', prompt, answers: ['valida1', 'valida2'], explain, strictArticle? }
// Se ignoran mayúsculas, tildes, signos y el artículo del principio ("el león" vale como "león").
// Si el artículo forma parte de la respuesta (preguntas de Lengua sobre artículos), la pregunta lleva strictArticle: true.
const key = (q, text) => (q.strictArticle ? norm(text) : stripArticle(norm(text)));

export const text = {
  render: textInputRender({ inputmode: 'text', parse: (raw) => (raw.trim() === '' ? null : raw) }),
  check: (q, value) => value != null && q.answers.some((accepted) => key(q, accepted) === key(q, value)),
  answerText: (q) => q.answers[0],
  givenText: (q, value) => (value == null ? '' : String(value)),
};
