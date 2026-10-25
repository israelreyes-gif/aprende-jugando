import { rnd } from '../../../../../core/random.js';
import { fmt } from '../../../../../shared/number-format.js';
import { numberQ } from '../../../../../exercises/make/number.js';

const sinRepetidas = (n) => new Set(String(n)).size === String(n).length;

/** Primer número siguiente a uno dado que no tiene ninguna cifra repetida. */
export function sinRepetir() {
  const x = rnd(1000, 99999);
  let y = x + 1;
  while (!sinRepetidas(y)) y++;
  return numberQ(
    `¿Cuál es el primer número sin ninguna cifra repetida después de ${fmt(x)}?`,
    y,
    `Prueba ${fmt(x + 1)}, ${fmt(x + 2)}… hasta que ninguna cifra se repita: ${fmt(y)}.`,
    { thousands: true },
  );
}
