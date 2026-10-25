/** Pregunta de varios números: fields = [{ label, answer }]. extra puede llevar { thousands, visual }. */
export function multiQ(prompt, fields, explain, extra = {}) {
  return { type: 'multi', prompt, fields, explain, ...extra };
}
