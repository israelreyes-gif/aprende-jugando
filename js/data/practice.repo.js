import { api } from '../core/api.js';
import { uuid } from '../core/ids.js';

/**
 * Guarda una sesión de ejercicios con todas sus respuestas.
 * results: [{ questionId, correct, given }]
 * kind: 'practice' (ejercicios de un tema) o 'reto' (las preguntas de un tema dentro del reto diario).
 * sessionId: si se da, guardar dos veces la misma sesión no la duplica (lo usa el reto).
 * Devuelve { queued } (true si se guardó solo en el dispositivo por falta de conexión).
 */
export async function savePractice({ profileId, courseId, subjectId, topicId, results, durationS, kind = 'practice', sessionId = uuid() }) {
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
    kind,
  };

  const answers = results.map((r, i) => ({
    id: `${sessionId}:${i}`,
    session_id: sessionId,
    question_id: `${topicId}:${r.questionId}`,
    is_correct: r.correct ? 1 : 0,
    given: r.given == null ? null : String(r.given).slice(0, 200),
  }));

  const first = await api.queueInsert('practice_sessions', session, { profileId });
  const second = await api.queueInsert('answers', answers, { profileId });
  return { queued: first.queued || second.queued };
}

const PAGE = 1000;
const MAX_PAGES = 50; // tope de seguridad: 50 000 sesiones

/** Sesiones de un perfil, de la más reciente a la más antigua. Lee todas, por páginas (los puntos y las estadísticas dependen de no perder ninguna). */
export async function listSessions(profileId, { subjectId, topicId } = {}) {
  const where = { profile_id: profileId };
  if (subjectId) where.subject_id = subjectId;
  if (topicId) where.topic_id = topicId;
  const all = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const rows = await api.list('practice_sessions', { where, order: 'finished_at.desc,id.desc', limit: PAGE, offset: page * PAGE });
    all.push(...rows);
    if (rows.length < PAGE) break;
  }
  return all;
}
