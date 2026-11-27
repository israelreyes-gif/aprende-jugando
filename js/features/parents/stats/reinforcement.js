import { recentPct } from './recent-pct.js';
import { REINFORCE_BELOW } from './thresholds.js';

/**
 * Temas cuyos últimos intentos están por debajo del umbral, de peor a mejor.
 * releasedRows (filas de topic_release del perfil): si se pasan, solo cuentan los temas liberados
 * (un tema bloqueado no se puede practicar, así que no tiene sentido pedir refuerzo).
 */
export function findReinforcement(sessions, releasedRows) {
  const released = releasedRows && new Set(releasedRows.map((r) => `${r.course_id}|${r.subject_id}|${r.topic_id}`));
  const groups = new Map();
  for (const s of sessions) {
    const key = `${s.course_id}|${s.subject_id}|${s.topic_id}`;
    if (released && !released.has(key)) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }

  const result = [];
  for (const group of groups.values()) {
    const pct = recentPct(group);
    if (pct !== null && pct < REINFORCE_BELOW) {
      const { course_id: courseId, subject_id: subjectId, topic_id: topicId } = group[0];
      result.push({ courseId, subjectId, topicId, pct });
    }
  }
  return result.sort((a, b) => a.pct - b.pct);
}
