import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Un factor sube o baja 1: el resultado cambia en lo que vale el otro factor. */
export function unoMasOMenos() {
  const n = rnd(12, 60);
  const m = rnd(3, 9);
  const sube = Math.random() < 0.5;
  return numberQ(
    `Si ${n} × ${m} = ${n * m}, ¿cuánto es ${sube ? n + 1 : n - 1} × ${m}?`,
    n * m + (sube ? m : -m),
    `${sube ? 'Hay un grupo más' : 'Hay un grupo menos'}, o sea ${sube ? '+' : '−'}${m}.`,
  );
}
