import { addDays } from './date-keys.js';
import { mondayOf } from './week-start.js';

/**
 * Racha que tenía el perfil cada día en que hizo el reto: Map 'AAAA-MM-DD' -> número de racha (con ese día incluido).
 * Mismas reglas que computeStreak (día de cortesía por semana, segundo día sin reto la pone a 0),
 * pero de una sola pasada. doneDays: fechas 'AAAA-MM-DD' con el reto terminado.
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
