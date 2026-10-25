import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Sumar tres números seguidos: es tres veces el del medio. */
export function tresSeguidos() {
  const s = rnd(100, 999);
  return numberQ(
    `Suma tres números seguidos: ${s} + ${s + 1} + ${s + 2}`,
    3 * s + 3,
    `Es 3 veces el del medio: 3 × ${s + 1} = ${3 * s + 3}.`,
  );
}
