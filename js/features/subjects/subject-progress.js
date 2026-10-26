import { bestAttempt, recentPct, reinforceLevel } from '../parents/stats.logic.js';

/** Resume lo liberado, lo estudiado, el mejor intento y el nivel de refuerzo de cada tema para pintar las tarjetas. */
export function buildProgress(topics, studiedRows, sessions, releasedRows) {
  const sessionsOf = (topic) => sessions.filter((s) => s.topic_id === topic.id);
  return {
    released: new Set(releasedRows.map((row) => row.topic_id)),
    studied: new Set(studiedRows.map((row) => row.topic_id)),
    best: new Map(topics.map((topic) => [topic.id, bestAttempt(sessionsOf(topic))])),
    level: new Map(topics.map((topic) => [topic.id, reinforceLevel(recentPct(sessionsOf(topic)))])),
  };
}
