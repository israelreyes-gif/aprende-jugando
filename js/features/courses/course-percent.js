/**
 * Porcentaje del curso: temas estudiados sobre los temas con contenido.
 * entries: lo que devuelve loadCourseProgress() (una por asignatura, con total y studied).
 * Devuelve { studied, total, pct, missing } (missing: % que falta).
 */
export function coursePercent(entries) {
  const total = entries.reduce((sum, e) => sum + e.total, 0);
  const studied = entries.reduce((sum, e) => sum + e.studied, 0);
  const pct = total === 0 ? 0 : Math.round((studied * 100) / total);
  return { studied, total, pct, missing: total === 0 ? 0 : 100 - pct };
}
