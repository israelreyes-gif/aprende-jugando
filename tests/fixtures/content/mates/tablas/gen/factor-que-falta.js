import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** ? × b = producto: encontrar el factor que falta. */
export function factorQueFalta() {
  const a = rnd(2, 10);
  const b = rnd(2, 10);
  return numberQ(`? × ${b} = ${a * b}`, a, `${a * b} : ${b} = ${a}, porque ${a} × ${b} = ${a * b}.`);
}
