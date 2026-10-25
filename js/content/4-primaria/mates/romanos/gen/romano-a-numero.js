import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';
import { toRoman } from '../../lib/to-roman.js';

/** Leer un número romano y escribirlo con cifras. */
export function romanoANumero() {
  const n = rnd(4, 99);
  return numberQ(`¿Qué número es ${toRoman(n)}? Escríbelo con cifras.`, n, `${toRoman(n)} = ${n}.`);
}
