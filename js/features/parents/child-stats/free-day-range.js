import { addDays, spainDay } from '../../reto/streak/date-keys.js';

/** Cuántos días hacia atrás y hacia delante se puede marcar un día libre. */
export const PAST_DAYS = 30;
export const FUTURE_DAYS = 60;

/** Primer y último día que se pueden marcar, y el de hoy. */
export function freeDayRange(now = new Date()) {
  const today = spainDay(now);
  return { today, min: addDays(today, -PAST_DAYS), max: addDays(today, FUTURE_DAYS) };
}

/** true si es una fecha 'AAAA-MM-DD' real y está dentro del rango. */
export function isValidFreeDay(day, range) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  if (Number.isNaN(Date.parse(`${day}T00:00:00Z`)) || addDays(day, 0) !== day) return false;
  return day >= range.min && day <= range.max;
}

/** "viernes, 27 de noviembre" */
export const freeDayText = (day) => new Date(`${day}T00:00:00Z`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
