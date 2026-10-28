import { addDays, mondayOf } from './reminder-dates.js';

/**
 * Racha: días seguidos con el reto hecho. Copia de js/features/reto/streak/compute-streak.js.
 * - Cada semana (lunes a domingo) tiene un día de cortesía: ese día sin reto no suma ni rompe la racha.
 * - El segundo día sin reto de la misma semana pone la racha a 0.
 * - Hoy todavía no cuenta como fallo.
 * doneDays: fechas 'AAAA-MM-DD' con el reto terminado. today: 'AAAA-MM-DD'.
 */
export function computeStreak(doneDays, today) {
  const done = new Set(doneDays);
  if (done.size === 0) return 0;

  let streak = 0;
  let graceWeek = null;
  for (let day = [...done].sort()[0]; day < today; day = addDays(day, 1)) {
    if (done.has(day)) {
      streak += 1;
    } else if (graceWeek !== mondayOf(day)) {
      graceWeek = mondayOf(day);
    } else {
      streak = 0;
    }
  }
  return done.has(today) ? streak + 1 : streak;
}
