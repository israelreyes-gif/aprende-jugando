import { fieldsRender } from './fields-render.js';

// Respuesta libre validada por una regla (hay muchas respuestas correctas):
// { id, type: 'rule', prompt, fields: [{ label, kind?: 'number' | 'text' }], test: (values) => boolean, example, explain }
// test recibe los valores en el mismo orden que fields (números o textos).
export const rule = {
  render: fieldsRender({ kindOf: (field) => field.kind || 'number' }),
  check: (q, value) => Array.isArray(value) && Boolean(q.test(value)),
  answerText: (q) => q.example,
  givenText: (q, value) => (value ? value.join(' · ') : ''),
};
