import { norm } from './text-normalize.js';

const words = (text) => String(text).toLowerCase().replace(/[^\p{L}\p{N} ]/gu, '').split(/\s+/).filter(Boolean);

/**
 * Palabras de una respuesta ya aceptada que se escribieron sin su tilde (o con una de más).
 * Devuelve cómo se escriben bien: ['águila', 'árbol']. [] si no hay nada que avisar.
 * given: lo que escribió; accepted: respuestas válidas.
 */
export function accentWarning(given, accepted) {
  const written = words(given);
  if (accepted.some((answer) => words(answer).every((word) => written.includes(word)))) return []; // alguna respuesta válida está tal cual
  for (const answer of accepted) {
    const wrong = words(answer).filter((word) => !written.includes(word) && written.some((w) => norm(w) === norm(word)));
    if (wrong.length) return wrong;
  }
  return [];
}
