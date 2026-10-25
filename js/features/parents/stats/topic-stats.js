import { bestAttempt } from './best-attempt.js';
import { pctOf, sum } from './math.js';

/**
 * Una fila por tema con contenido: si está liberado, si está estudiado y cómo van sus ejercicios.
 * sessions: practice_sessions del perfil en esa asignatura.
 */
export function topicStats(topics, courseId, subjectId, releasedRows, studiedRows, sessions) {
  const has = (rows, topicId) => rows.some((r) => r.course_id === courseId && r.subject_id === subjectId && r.topic_id === topicId);

  return topics
    .filter((topic) => topic.available)
    .map((topic) => {
      const own = sessions.filter((s) => s.course_id === courseId && s.subject_id === subjectId && s.topic_id === topic.id);
      return {
        topicId: topic.id,
        title: topic.title,
        released: has(releasedRows, topic.id),
        studied: has(studiedRows, topic.id),
        attempts: own.length,
        best: bestAttempt(own),
        pct: pctOf(sum(own, 'correct'), sum(own, 'total')),
      };
    });
}
