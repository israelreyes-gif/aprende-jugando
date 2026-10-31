// ¿Toca el resumen semanal? Domingo a las 20:00, hora REAL de Madrid (el cron salta cada 30 minutos).
const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

export function isWeeklyReportTime(date) {
  const parts = Object.fromEntries(clock.formatToParts(date).map((p) => [p.type, p.value]));
  return parts.weekday === 'Sun' && parts.hour === '20' && parts.minute === '00';
}
