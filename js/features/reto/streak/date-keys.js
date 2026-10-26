const DAY_MS = 86_400_000;

/** Día de hoy en España como 'AAAA-MM-DD'. El día cambia a medianoche, hora de España. */
export function spainDay(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

/** Suma (o resta) días a una fecha 'AAAA-MM-DD'. */
export function addDays(key, n) {
  return new Date(Date.parse(`${key}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
}
