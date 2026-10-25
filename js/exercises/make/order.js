/** Pregunta de ordenar tocando: answer = textos distintos, ya en el orden correcto. */
export function orderQ(prompt, answer, explain) {
  return { type: 'order', prompt, answer, explain };
}
