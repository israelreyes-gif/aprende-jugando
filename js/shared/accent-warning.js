import { norm } from './text-normalize.js';

const words = (text) => String(text).toLowerCase().replace(/[^\p{L}\p{N} ]/gu, '').split(/\s+/).filter(Boolean);
const hasAccent = (word) => /[̀-ͯ]/.test(word.replace(/ñ/g, 'n').normalize('NFD')); // tilde o diéresis (la ñ no cuenta)

/**
 * Palabras de una respuesta ya aceptada que se escribieron sin su tilde.
 * Devuelve cómo se escriben bien: ['águila', 'árbol']. [] si no hay nada que avisar.
 * given: lo que escribió; accepted: respuestas válidas (pueden listar la forma con y sin tilde).
 */
export function accentWarning(given, accepted) {
  const written = words(given);
  const wrong = new Set();
  for (const answer of accepted)
    for (const word of words(answer))
      if (hasAccent(word) && !written.includes(word) && written.some((w) => norm(w) === norm(word))) wrong.add(word);
  return [...wrong];
}
