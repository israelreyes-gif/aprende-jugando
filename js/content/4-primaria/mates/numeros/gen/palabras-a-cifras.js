import { rnd } from '../../../../../core/random.js';
import { fmt } from '../../../../../shared/number-format.js';
import { numberQ } from '../../../../../exercises/make/number.js';
import { palabras } from '../../lib/palabras.js';

/** Número escrito con palabras: escribirlo con cifras. */
export function palabrasACifras() {
  const n = rnd(1, 999) * 1000 + (Math.random() < 0.4 ? 0 : rnd(1, 999));
  return numberQ(`Escribe con cifras: ${palabras(n)}`, n, `${palabras(n)} = ${fmt(n)}.`, { thousands: true });
}
