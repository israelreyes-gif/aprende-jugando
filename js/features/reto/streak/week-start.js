import { addDays } from './date-keys.js';

/** Lunes de la semana a la que pertenece una fecha 'AAAA-MM-DD' (las semanas van de lunes a domingo). */
export function mondayOf(key) {
  const weekday = new Date(`${key}T00:00:00Z`).getUTCDay(); // 0 = domingo
  return addDays(key, -((weekday + 6) % 7));
}
