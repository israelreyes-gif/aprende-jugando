import { pick } from '../../../../core/random.js';

// Complementos (cada uno es una lista de fichas). Frases de ejemplo de Claude con vocabulario de su cuaderno.
const SING = [['a', 'doctor'], ['a', 'teacher'], ['a', 'student'], ['a', 'pilot'], ['Spanish'], ['tall'], ['happy'], ['from', 'Spain'], ['from', 'France']];
const PLURAL = [['doctors'], ['teachers'], ['students'], ['pilots'], ['Spanish'], ['tall'], ['happy'], ['from', 'Spain'], ['from', 'Italy']];
const THING = [['a', 'notebook'], ['a', 'clock'], ['a', 'book'], ['red'], ['big'], ['new']];

/** Complementos que suenan bien con el pronombre `p`. */
export function compsFor(p) {
  if (p.thing) return THING;
  if (p.be === 'is' || p.w === 'I') return SING;
  if (p.w === 'You') return [...SING, ...PLURAL.filter((c) => c.length === 1 || c[0] === 'from')];
  return PLURAL;
}
export const COMPS = { SING, PLURAL, THING };
export { pick };
