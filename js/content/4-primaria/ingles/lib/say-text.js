// Qué texto en inglés se puede escuchar de una pregunta (se ofrece tras comprobarla).
// Cada ejercicio declara su regla en `exercises.js`; los textos en español nunca se leen.
import { questionTypes } from '../../../../exercises/kinds/index.js';

const quoted = (q) => (q.prompt.match(/"([^"]+)"/) || [])[1] || '';
const parts = (q) => q.prompt.split(/\s{2,}/);

// Frase de la pregunta con el hueco ___ ya relleno, más la respuesta que la sigue (sin los (paréntesis) de ayuda).
function fill(q, answer) {
  const segments = parts(q);
  const at = segments.findIndex((s) => s.includes('___'));
  if (at < 0) return answer;
  const sentence = segments[at].replace('___', answer);
  const reply = segments.slice(at + 1).filter((s) => !s.startsWith('('));
  return [sentence, ...reply].join(' ');
}

const rules = {
  answer: (q, answer) => answer,
  fill: (q, answer) => fill(q, answer),
  quoted: (q) => quoted(q),
  'quoted+answer': (q, answer) => `${quoted(q)} ${answer}`,
  'answer+quoted': (q, answer) => `${answer} ${quoted(q)}`,
  'last+answer': (q, answer) => `${parts(q).at(-1)} ${answer}`,
  translate: (q, answer) => (answer.includes('¿') ? quoted(q) : answer),
};

/** Devuelve la pregunta con `say` (texto en inglés para el botón 🔊) según la regla de su ejercicio. */
export function withSayText(q, rule) {
  const answer = questionTypes[q.type].answerText(q);
  const say = rules[rule](q, answer).replace(/\s+/g, ' ').trim();
  return say ? { ...q, say } : q;
}
