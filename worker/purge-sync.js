import { isWeeklyReportTime } from './report-time.js';

export const SYNC_KEEP_DAYS = 90;

/** Borra los avisos de sincronización de hace más de 90 días (solo se necesitan los de las últimas semanas). Devuelve cuántos borró. */
export async function purgeOldSyncEvents(db, now = Date.now()) {
  const limit = new Date(now - SYNC_KEEP_DAYS * 24 * 3600 * 1000).toISOString();
  const result = await db.prepare('DELETE FROM sync_events WHERE created_at < ?').bind(limit).run();
  return result?.meta?.changes ?? 0;
}

/** Una vez a la semana (domingo, a la hora del resumen) limpia lo antiguo. Nunca lanza. */
export async function purgeWeekly(env, scheduledTime) {
  try {
    if (!env.DB || !isWeeklyReportTime(new Date(scheduledTime))) return 0;
    return await purgeOldSyncEvents(env.DB, scheduledTime);
  } catch (err) {
    console.error('No se pudo limpiar sync_events', String(err?.message || err));
    return 0;
  }
}
