import { addDays } from '../../reto/streak/date-keys.js';

/**
 * TEMPORAL. Días sin reto: desde el primer reto hecho (o desde `min`, si es más reciente) hasta ayer,
 * sin contar los que ya son libres. Hoy no cuenta (aún puede hacerlo).
 */
export function missedDays({ doneDays, freeDays, today, min }) {
  const done = new Set(doneDays);
  const free = new Set(freeDays);
  const first = [...done].sort().find((day) => day >= min);
  if (!first) return [];
  const out = [];
  for (let day = first; day < today; day = addDays(day, 1)) if (!done.has(day) && !free.has(day)) out.push(day);
  return out;
}
