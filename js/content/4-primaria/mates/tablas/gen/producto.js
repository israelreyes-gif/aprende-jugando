import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';
import { truco } from '../truco.js';

/** a × b = ? con a y b de 2 a 10. */
export function producto() {
  const a = rnd(2, 10);
  const b = rnd(2, 10);
  return numberQ(`${a} × ${b} =`, a * b, `${a} × ${b} = ${a * b}. ${truco(a, b)}`);
}
