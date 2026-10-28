import { addDays } from '../reto/streak/date-keys.js';

/** Puntos de hoy, de los últimos 7 días y día a día (del más antiguo a hoy). today: 'AAAA-MM-DD'. */
export function periodPoints(byDay, today) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(today, i - 6);
    return { day, points: byDay.get(day) || 0 };
  });
  return { today: days[6].points, week: days.reduce((sum, d) => sum + d.points, 0), days };
}
