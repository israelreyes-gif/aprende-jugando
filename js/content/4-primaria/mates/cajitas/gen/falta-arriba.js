import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';
import { cajita } from '../../lib/cajita.js';

/** Cajita con el producto oculto: ¿qué número va arriba? */
export function faltaArriba() {
  const a = rnd(2, 9);
  const b = rnd(2, 9);
  return numberQ('¿Qué número va arriba?', a * b, `Arriba va el producto: ${a} × ${b} = ${a * b}.`, {
    visual: cajita('?', a, b),
  });
}
