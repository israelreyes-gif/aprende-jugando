// Fechas en hora de España. Copia de js/features/reto/streak/date-keys.js y week-start.js
// (el Worker no puede importar archivos de la app; reminder-test lo comprueba).
const DAY_MS = 86_400_000;

/** Día de España como 'AAAA-MM-DD'. El día cambia a medianoche, hora de España. */
export function spainDay(date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

/** Suma (o resta) días a una fecha 'AAAA-MM-DD'. */
export function addDays(key, n) {
  return new Date(Date.parse(`${key}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
}

/** Lunes de la semana a la que pertenece una fecha 'AAAA-MM-DD' (las semanas van de lunes a domingo). */
export function mondayOf(key) {
  const weekday = new Date(`${key}T00:00:00Z`).getUTCDay(); // 0 = domingo
  return addDays(key, -((weekday + 6) % 7));
}
