const WEEK_MS = 7 * 24 * 3600 * 1000;

/**
 * Resumen de la sincronización de la última semana.
 * events: filas de sync_events. activity: guardados de la semana (sesiones y temas estudiados).
 * Devuelve { ok, late, failed, last } ("last": el último fallo, o null).
 */
export function summarizeSync(events, activity, now = Date.now()) {
  const recent = events.filter((e) => now - Date.parse(e.created_at) <= WEEK_MS);
  const late = recent.filter((e) => e.outcome === 'late').length;
  const failed = recent.filter((e) => e.outcome === 'failed').length;
  const last = recent.find((e) => e.outcome === 'failed') || null;
  return { ok: Math.max(0, activity - late - failed), late, failed, last };
}

/** Cuántas sesiones y temas estudiados de la lista caen en la última semana. */
export function weekActivity(rows, field, now = Date.now()) {
  return rows.filter((r) => now - Date.parse(r[field]) <= WEEK_MS).length;
}
