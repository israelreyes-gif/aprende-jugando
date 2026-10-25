/** Pregunta de elegir. La correcta va primera: la pantalla desordena las opciones. Las opciones deben ser distintas. */
export function choiceQ(prompt, right, wrongs, explain, extra = {}) {
  return { type: 'choice', prompt, options: [right, ...wrongs], answer: 0, explain, ...extra };
}
