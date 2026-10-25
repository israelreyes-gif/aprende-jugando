/** Pregunta de tocar figuras: items = [{ visual: '<svg…>', label, correct }]. */
export function tapQ(prompt, items, explain) {
  return { type: 'tap', prompt, items, explain };
}
