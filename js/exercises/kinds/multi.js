import { numberLabel } from './number-label.js';
import { fieldsRender } from './fields-render.js';

const same = (a, b) => Math.abs(a - b) < 1e-9;

// Varios números: { id, type: 'multi', prompt, fields: [{ label, answer }], explain, thousands?: true }
// Por ejemplo cociente y resto. Se marca cada campo por separado.
export const multi = {
  render: fieldsRender({
    kindOf: () => 'number',
    judge: (q, value, i) => same(value[i], q.fields[i].answer),
  }),
  check: (q, value) => Array.isArray(value) && q.fields.every((f, i) => same(value[i], f.answer)),
  answerText: (q) => q.fields.map((f) => numberLabel(f.answer, q.thousands)).join(' · '),
  givenText: (q, value) => (value ? value.join(' · ') : ''),
};
