import { pick, shuffle } from '../../../../core/random.js';

// Verbo to be. `es` es la forma en español de su cuaderno.
export const PRONOUNS = [
  { w: 'I', be: 'am', c: "I'm", neg: ["I'm", 'not'], q: 'Am', es: 'yo soy' },
  { w: 'You', be: 'are', c: "You're", neg: ['You', "aren't"], q: 'Are', es: 'tú eres' },
  { w: 'He', be: 'is', c: "He's", neg: ['He', "isn't"], q: 'Is', es: 'él es', person: true },
  { w: 'She', be: 'is', c: "She's", neg: ['She', "isn't"], q: 'Is', es: 'ella es', person: true },
  { w: 'It', be: 'is', c: "It's", neg: ['It', "isn't"], q: 'Is', es: 'ello es', thing: true },
  { w: 'We', be: 'are', c: "We're", neg: ['We', "aren't"], q: 'Are', es: 'nosotros somos' },
  { w: 'You', be: 'are', c: "You're", neg: ['You', "aren't"], q: 'Are', es: 'vosotros sois' },
  { w: 'They', be: 'are', c: "They're", neg: ['They', "aren't"], q: 'Are', es: 'ellos son' },
];

export const BES = ['am', 'is', 'are'];
export const otherBes = (be) => BES.filter((b) => b !== be);
const lower = (p) => (p.w === 'I' ? 'I' : p.w.toLowerCase());

/** Fichas de la frase: pos "She is Spanish." · neg "She isn't Spanish." · q "Is she Spanish?" (be: por si se quiere una forma equivocada). */
export function tokens(kind, p, comp, be = p.be) {
  const last = comp.length - 1;
  const body = comp.map((t, i) => (i === last && kind !== 'q' ? `${t}.` : t));
  if (kind === 'pos') return [p.w, be, ...body];
  if (kind === 'neg') return [...p.neg, ...body];
  const qbody = comp.map((t, i) => (i === last ? `${t}?` : t));
  const q = be === 'am' ? 'Am' : be === 'is' ? 'Is' : 'Are';
  return [q, lower(p), ...qbody];
}

export const sentence = (kind, p, comp, be) => tokens(kind, p, comp, be).join(' ');
export const withContraction = (p, comp) => `${p.c} ${comp.join(' ')}.`;
export { pick, shuffle };
