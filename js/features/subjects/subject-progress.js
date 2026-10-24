import { bestAttempt } from '../parents/stats.logic.js';

/** Resume lo estudiado y el mejor intento de cada tema para pintar las tarjetas. */
export function buildProgress(topics, studiedRows, sessions) {
  return {
    studied: new Set(studiedRows.map((row) => row.topic_id)),
    best: new Map(topics.map((topic) => [topic.id, bestAttempt(sessions.filter((s) => s.topic_id === topic.id))])),
  };
}
