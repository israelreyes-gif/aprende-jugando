import { rnd } from '../../../../../core/random.js';
import { fmt } from '../../../../../shared/number-format.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Primer número par mayor que uno dado. */
export function siguientePar() {
  const x = rnd(100, 9999);
  const y = x % 2 ? x + 1 : x + 2;
  return numberQ(
    `¿Cuál es el primer número par mayor que ${fmt(x)}?`,
    y,
    `${x % 2 ? 'Es impar, así que el siguiente' : 'Es par, así que hay que saltar dos'}: ${fmt(y)}.`,
    { thousands: true },
  );
}
