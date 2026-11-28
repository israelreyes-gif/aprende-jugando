import { addDays } from '../streak/date-keys.js';

/** Hasta cuántos días atrás se puede proteger un día (igual que en el Worker). */
export const SHIELD_WINDOW_DAYS = 7;

/**
 * Días que se pueden proteger: de los últimos 7 anteriores a hoy, posteriores al primer reto,
 * sin reto hecho y sin ser ya libres ni estar protegidos. De más antiguo a más reciente.
 */
export function missedDays(doneDays, freeDays, shieldDays, today) {
  if (doneDays.length === 0) return [];
  const first = [...doneDays].sort()[0];
  const taken = new Set([...doneDays, ...freeDays, ...shieldDays]);
  const out = [];
  for (let back = SHIELD_WINDOW_DAYS; back >= 1; back--) {
    const day = addDays(today, -back);
    if (day > first && !taken.has(day)) out.push(day);
  }
  return out;
}
