// Temas que necesitan refuerzo. Copia de js/features/parents/stats/recent-pct.js y thresholds.js (el Worker no puede importar la app).
const REINFORCE_BELOW = 75;
const LAST_QUESTIONS = 24;

/** % de aciertos de las últimas 24 preguntas (null si no hay ninguna). sessions: { total, correct, finished_at }. */
export function recentPct(sessions) {
  const newestFirst = sessions.slice().sort((a, b) => new Date(b.finished_at) - new Date(a.finished_at));
  let asked = 0;
  let correct = 0;
  for (const s of newestFirst) {
    if (asked >= LAST_QUESTIONS) break;
    const take = Math.min(s.total, LAST_QUESTIONS - asked);
    correct += (s.correct * take) / s.total;
    asked += take;
  }
  return asked > 0 ? Math.round((correct * 100) / asked) : null;
}

const keyOf = (row) => `${row.course_id}|${row.subject_id}|${row.topic_id}`;

/** Ids de los temas liberados con menos del 75 %, del más flojo al menos flojo. */
export function reinforceTopics(sessions, releasedRows) {
  const released = new Set(releasedRows.map(keyOf));
  const byTopic = new Map();
  for (const s of sessions) {
    if (released.has(keyOf(s))) byTopic.set(keyOf(s), [...(byTopic.get(keyOf(s)) || []), s]);
  }
  return [...byTopic.entries()]
    .map(([key, list]) => ({ topicId: key.split('|')[2], pct: recentPct(list) }))
    .filter((t) => t.pct != null && t.pct < REINFORCE_BELOW)
    .sort((a, b) => a.pct - b.pct)
    .map((t) => t.topicId);
}
