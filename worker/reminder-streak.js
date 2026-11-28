import { addDays } from './reminder-dates.js';

/**
 * Racha: días seguidos con el reto hecho. Copia de js/features/reto/streak/compute-streak.js.
 * - El primer día sin reto la pone a 0 (no hay día de gracia).
 * - Un día libre (puesto por los padres) o protegido con un diamante ni suma ni rompe la racha.
 * - Hoy todavía no cuenta como fallo: si aún no lo ha hecho, la racha no se rompe hasta que acabe el día.
 * doneDays: fechas 'AAAA-MM-DD' con el reto terminado. today: 'AAAA-MM-DD'. freeDays: días que no rompen la racha.
 */
export function computeStreak(doneDays, today, freeDays = []) {
  const done = new Set(doneDays);
  const free = new Set(freeDays);
  if (done.size === 0) return 0;

  let streak = 0;
  for (let day = [...done].sort()[0]; day < today; day = addDays(day, 1)) {
    if (done.has(day)) streak += 1;
    else if (!free.has(day)) streak = 0;
  }
  return done.has(today) ? streak + 1 : streak;
}
