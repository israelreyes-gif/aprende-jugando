import { addDays } from './reminder-dates.js';

/**
 * Copia de js/features/reto/streak/streak-by-day.js.
 * Racha que tenía el perfil cada día en que hizo el reto: Map 'AAAA-MM-DD' -> número de racha (con ese día incluido).
 * Mismas reglas que computeStreak (el primer día sin reto la pone a 0; los días libres o protegidos ni suman ni rompen),
 * pero de una sola pasada. doneDays: fechas 'AAAA-MM-DD' con el reto terminado.
 */
export function streakByDay(doneDays, freeDays = []) {
  const done = new Set(doneDays);
  const free = new Set(freeDays);
  const result = new Map();
  if (done.size === 0) return result;

  const days = [...done].sort();
  let streak = 0;
  for (let day = days[0]; day <= days[days.length - 1]; day = addDays(day, 1)) {
    if (done.has(day)) {
      streak += 1;
      result.set(day, streak);
    } else if (!free.has(day)) {
      streak = 0;
    }
  }
  return result;
}
