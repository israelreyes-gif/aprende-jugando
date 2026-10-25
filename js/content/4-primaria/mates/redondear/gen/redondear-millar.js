import { rnd } from '../../../../../core/random.js';
import { fmt } from '../../../../../shared/number-format.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Redondear un número de cuatro cifras a la unidad de millar más cercana. */
export function redondearMillar() {
  const n = rnd(1001, 9999);
  const centena = Math.floor(n / 100) % 10;
  const r = Math.round(n / 1000) * 1000;
  return numberQ(
    `Redondea ${fmt(n)} a la unidad de millar más cercana.`,
    r,
    `Mira la centena (${centena}): ${centena >= 5 ? 'es 5 o más, sube' : 'es menos de 5, baja'} → ${fmt(r)}.`,
    { thousands: true },
  );
}
