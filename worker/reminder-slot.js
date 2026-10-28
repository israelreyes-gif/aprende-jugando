// Cloudflare programa en hora UTC y España cambia de hora dos veces al año, así que el cron se
// dispara en las dos horas posibles y aquí se mira la hora REAL de Madrid.
const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

/** Qué recordatorio toca a esa hora: 'morning' (08:00), 'evening' (18:30) o null (ninguno). */
export function reminderSlot(date) {
  const time = clock.format(date);
  if (time === '08:00') return 'morning';
  if (time === '18:30') return 'evening';
  return null;
}
