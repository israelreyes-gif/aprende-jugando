import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Multiplicar un número de tres cifras por 2, 3 o 4, descomponiéndolo en centenas, decenas y unidades. */
export function tresCifras() {
  const a = rnd(101, 499);
  const b = rnd(2, 4);
  const c = Math.floor(a / 100) * 100;
  const d = (Math.floor(a / 10) % 10) * 10;
  const u = a % 10;
  return numberQ(
    `${a} × ${b} =`,
    a * b,
    `${c} × ${b} = ${c * b}, ${d} × ${b} = ${d * b} y ${u} × ${b} = ${u * b}. Suma: ${a * b}.`,
    { thousands: true },
  );
}
