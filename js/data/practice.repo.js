import { api } from '../core/api.js';
import { uuid } from '../core/ids.js';

/**
 * Guarda una sesión de ejercicios con todas sus respuestas.
 * results: [{ questionId, correct, given }]
 * Devuelve { queued } (true si se guardó solo en el dispositivo por falta de conexión).
 */
export async function savePractice({ profileId, courseId, subjectId, topicId, results, durationS }) {
  const sessionId = uuid();
  const correct = results.filter((r) => r.correct).length;

  const session = {
    id: sessionId,
    profile_id: profileId,
    course_id: courseId,
    subject_id: subjectId,
    topic_id: topicId,
    total: results.length,
    correct,
    duration_s: Math.max(0, Math.round(durationS)),
    finished_at: new Date().toISOString(),
  };

  const answers = results.map((r) => ({
    id: uuid(),
    session_id: sessionId,
    question_id: `${topicId}:${r.questionId}`,
    is_correct: r.correct ? 1 : 0,
    given: r.given == null ? null : String(r.given).slice(0, 200),
  }));

  const first = await api.queueInsert('practice_sessions', session);
  const second = await api.queueInsert('answers', answers);
  return { queued: first.queued || second.queued };
}

/** Sesiones de un perfil, de la más reciente a la más antigua. */
export function listSessions(profileId, { subjectId, topicId } = {}) {
  const where = { profile_id: profileId };
  if (subjectId) where.subject_id = subjectId;
  if (topicId) where.topic_id = topicId;
  return api.list('practice_sessions', { where, order: 'finished_at.desc', limit: 2000 });
}
