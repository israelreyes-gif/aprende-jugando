import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Redondear un número de tres cifras a la centena más cercana. */
export function redondearCentena() {
  const n = rnd(101, 999);
  const decena = Math.floor(n / 10) % 10;
  const r = Math.round(n / 100) * 100;
  return numberQ(
    `Redondea ${n} a la centena más cercana.`,
    r,
    `Mira la decena (${decena}): ${decena >= 5 ? 'es 5 o más, sube' : 'es menos de 5, baja'} → ${r}.`,
  );
}
