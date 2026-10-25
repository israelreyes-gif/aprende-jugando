import { rnd } from '../../../../../core/random.js';
import { textQ } from '../../../../../exercises/make/text.js';
import { toRoman } from '../../lib/to-roman.js';

/** Escribir un número con cifras en romanos. */
export function numeroARomano() {
  const n = rnd(4, 99);
  const romano = toRoman(n);
  return textQ(`Escribe ${n} en números romanos.`, [romano], `${n} = ${romano}.`);
}
