import { rnd } from '../../../../../core/random.js';
import { multiQ } from '../../../../../exercises/make/multi.js';

/** Dos multiplicaciones vecinas a partir de una conocida: ×10 y ×10 + 1 grupo. */
export function completar() {
  const a = rnd(2, 9);
  const b = rnd(2, 9);
  return multiQ(
    `Si ${a} × ${b} = ${a * b}, completa:`,
    [
      { label: `${a * 10} × ${b} =`, answer: a * b * 10 },
      { label: `${a * 10 + 1} × ${b} =`, answer: a * b * 10 + b },
    ],
    `${a * 10} × ${b} es 10 veces ${a * b}, y ${a * 10 + 1} × ${b} suma otros ${b}.`,
  );
}
