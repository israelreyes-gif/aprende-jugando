import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Un factor se parte por la mitad o se dobla: el resultado también. */
export function mitadODoble() {
  const mitad = Math.random() < 0.5;
  const n = mitad ? rnd(6, 30) * 2 : rnd(11, 40);
  const m = rnd(3, 9);
  return numberQ(
    `Si ${n} × ${m} = ${n * m}, ¿cuánto es ${mitad ? n / 2 : n * 2} × ${m}?`,
    mitad ? (n * m) / 2 : n * m * 2,
    mitad ? 'La mitad del factor da la mitad del resultado.' : 'El doble del factor da el doble del resultado.',
  );
}
