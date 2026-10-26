import { bestAttempt } from './best-attempt.js';
import { recentPct } from './recent-pct.js';
import { reinforceLevel } from './reinforce-level.js';

/**
 * Una fila por tema con contenido: si está liberado, si está estudiado y cómo van sus ejercicios.
 * recentPct: aciertos de los últimos intentos (el mismo número que decide el refuerzo).
 * level: 'red' | 'orange' | null; solo se marca en temas liberados.
 * sessions: practice_sessions del perfil en esa asignatura.
 */
export function topicStats(topics, courseId, subjectId, releasedRows, studiedRows, sessions) {
  const has = (rows, topicId) => rows.some((r) => r.course_id === courseId && r.subject_id === subjectId && r.topic_id === topicId);

  return topics
    .filter((topic) => topic.available)
    .map((topic) => {
      const own = sessions.filter((s) => s.course_id === courseId && s.subject_id === subjectId && s.topic_id === topic.id);
      const released = has(releasedRows, topic.id);
      const recent = recentPct(own);
      return {
        topicId: topic.id,
        title: topic.title,
        released,
        studied: has(studiedRows, topic.id),
        attempts: own.length,
        best: bestAttempt(own),
        recentPct: recent,
        level: released ? reinforceLevel(recent) : null,
      };
    });
}
