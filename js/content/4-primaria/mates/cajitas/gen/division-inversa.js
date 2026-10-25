import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** A partir de una multiplicación, resolver la división que la deshace. */
export function divisionInversa() {
  const a = rnd(2, 9);
  const b = rnd(2, 9);
  return numberQ(`Si ${a} × ${b} = ${a * b}, ¿cuánto es ${a * b} : ${a}?`, b, 'La división deshace la multiplicación.');
}
