import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Repartir una cantidad exacta de euros entre amigos. */
export function repartirEuros() {
  const amigos = rnd(3, 9);
  const cada = rnd(4, 15);
  return numberQ(
    `Repartimos ${amigos * cada} euros entre ${amigos} amigos por igual. ¿Cuánto recibe cada uno?`,
    cada,
    `${amigos * cada} : ${amigos} = ${cada}.`,
  );
}
