import { addDays, mondayOf } from './reminder-dates.js';

/**
 * Racha que tenía el perfil cada día en que hizo el reto: Map 'AAAA-MM-DD' -> número de racha (con ese día incluido).
 * Copia de js/features/reto/streak/streak-by-day.js (el Worker no puede importar archivos de la app).
 */
export function streakByDay(doneDays) {
  const done = new Set(doneDays);
  const result = new Map();
  if (done.size === 0) return result;

  const days = [...done].sort();
  let streak = 0;
  let graceWeek = null;
  for (let day = days[0]; day <= days[days.length - 1]; day = addDays(day, 1)) {
    if (done.has(day)) {
      streak += 1;
      result.set(day, streak);
    } else if (graceWeek !== mondayOf(day)) {
      graceWeek = mondayOf(day);
    } else {
      streak = 0;
    }
  }
  return result;
}
