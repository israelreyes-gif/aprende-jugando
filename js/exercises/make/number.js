/** Pregunta de escribir un número. extra puede llevar { thousands, visual }. */
export function numberQ(prompt, answer, explain, extra = {}) {
  return { type: 'number', prompt, answer, explain, ...extra };
}
