import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Multiplicar un número de dos cifras por una cifra, descomponiéndolo en decenas y unidades. */
export function decenasYUnidades() {
  const a = rnd(11, 99);
  const b = rnd(2, 9);
  const t = Math.floor(a / 10) * 10;
  const u = a % 10;
  return numberQ(`${a} × ${b} =`, a * b, `${t} × ${b} = ${t * b} y ${u} × ${b} = ${u * b}. Suma: ${a * b}.`);
}
