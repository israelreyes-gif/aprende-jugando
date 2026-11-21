import { HttpError } from './http.js';

const DAY_MS = 24 * 60 * 60 * 1000;
export const PAST_DAYS = 60; // una escritura guardada sin conexión puede llegar con retraso, pero no de hace meses

/** Fecha y hora (texto ISO) razonable: de hace como mucho 60 días a mañana. */
export function checkDate(value) {
  const time = typeof value === 'string' ? Date.parse(value) : NaN;
  const now = Date.now();
  if (Number.isNaN(time) || time > now + DAY_MS || time < now - PAST_DAYS * DAY_MS) throw new HttpError(400, 'Fecha no válida');
}

/** Día 'AAAA-MM-DD' razonable (con un día de margen por la zona horaria). */
export function checkDay(value) {
  const time = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? Date.parse(`${value}T12:00:00Z`) : NaN;
  const now = Date.now();
  if (Number.isNaN(time) || time > now + 2 * DAY_MS || time < now - (PAST_DAYS + 1) * DAY_MS) throw new HttpError(400, 'Día no válido');
}
