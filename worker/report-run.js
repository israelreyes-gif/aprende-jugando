import { spainDay } from './reminder-dates.js';
import { isWeeklyReportTime } from './report-time.js';
import { weeklyData } from './report-data.js';
import { weeklyReport } from './report-format.js';
import { sendTelegram, telegramConfigured } from './telegram-send.js';

/** Resumen semanal (domingo 20:00, hora de Madrid) por Telegram. Devuelve un resumen para el registro. */
export async function runWeeklyReport(env, scheduledTime) {
  const when = new Date(scheduledTime);
  if (!isWeeklyReportTime(when)) return { report: false };
  if (!telegramConfigured(env)) return { report: false, error: 'Faltan los secretos de Telegram' };
  const profiles = await weeklyData(env.DB, spainDay(when));
  const sent = await sendTelegram(env, weeklyReport(profiles));
  return { report: true, profiles: profiles.length, sent };
}
