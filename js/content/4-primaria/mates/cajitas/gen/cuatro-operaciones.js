import { rnd } from '../../../../../core/random.js';
import { multiQ } from '../../../../../exercises/make/multi.js';
import { cajita } from '../../lib/cajita.js';

/** Con los tres números de una cajita, escribir las 4 operaciones. */
export function cuatroOperaciones() {
  const a = rnd(2, 9);
  let b = rnd(2, 9);
  while (b === a) b = rnd(2, 9);
  const p = a * b;
  return multiQ(
    'Escribe las 4 operaciones de esta cajita.',
    [
      { label: `${a} × ${b} =`, answer: p },
      { label: `${b} × ${a} =`, answer: p },
      { label: `${p} : ${a} =`, answer: b },
      { label: `${p} : ${b} =`, answer: a },
    ],
    'Con una cajita salen siempre 4 operaciones.',
    { visual: cajita(p, a, b) },
  );
}
