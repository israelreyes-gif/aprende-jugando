/** Pregunta de texto. answers = respuestas válidas; se ignoran mayúsculas, tildes y signos. */
export function textQ(prompt, answers, explain, extra = {}) {
  return { type: 'text', prompt, answers, explain, ...extra };
}
