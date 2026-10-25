import { bestAttempt } from '../parents/stats.logic.js';

/** Resume lo liberado, lo estudiado y el mejor intento de cada tema para pintar las tarjetas. */
export function buildProgress(topics, studiedRows, sessions, releasedRows) {
  return {
    released: new Set(releasedRows.map((row) => row.topic_id)),
    studied: new Set(studiedRows.map((row) => row.topic_id)),
    best: new Map(topics.map((topic) => [topic.id, bestAttempt(sessions.filter((s) => s.topic_id === topic.id))])),
  };
}
