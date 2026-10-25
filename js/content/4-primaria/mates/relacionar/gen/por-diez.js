import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Un factor se hace 10 veces mayor: el resultado también. */
export function porDiez() {
  const a = rnd(2, 9);
  const b = rnd(2, 9);
  const primero = Math.random() < 0.5;
  const nueva = primero ? `${a * 10} × ${b}` : `${a} × ${b * 10}`;
  return numberQ(
    `Si ${a} × ${b} = ${a * b}, ¿cuánto es ${nueva}?`,
    a * b * 10,
    `Un factor es 10 veces mayor, así que el resultado también: ${a * b * 10}.`,
  );
}
