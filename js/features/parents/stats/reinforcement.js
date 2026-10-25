import { pctOf, sum } from './math.js';
import { REINFORCE_BELOW, REINFORCE_LAST_ATTEMPTS } from './thresholds.js';

/** Temas cuyos últimos intentos están por debajo del umbral, de peor a mejor. */
export function findReinforcement(sessions) {
  const groups = new Map();
  for (const s of sessions) {
    const key = `${s.course_id}|${s.subject_id}|${s.topic_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }

  const result = [];
  for (const group of groups.values()) {
    const latest = group
      .slice()
      .sort((a, b) => new Date(b.finished_at) - new Date(a.finished_at))
      .slice(0, REINFORCE_LAST_ATTEMPTS);
    const pct = pctOf(sum(latest, 'correct'), sum(latest, 'total'));
    if (pct !== null && pct < REINFORCE_BELOW) {
      const { course_id: courseId, subject_id: subjectId, topic_id: topicId } = latest[0];
      result.push({ courseId, subjectId, topicId, pct });
    }
  }
  return result.sort((a, b) => a.pct - b.pct);
}
