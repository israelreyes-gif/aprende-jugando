import { pctOf, sum } from './math.js';
import { findReinforcement } from './reinforcement.js';

/**
 * sessions: filas de practice_sessions { course_id, subject_id, topic_id, total, correct, finished_at }
 * subjectIds: ids de asignatura en el orden en que se quieren mostrar
 * streak: racha actual del reto diario (días seguidos)
 */
export function computeStats(sessions, subjectIds, streak = 0) {
  const totalQuestions = sum(sessions, 'total');
  const totalCorrect = sum(sessions, 'correct');

  const bySubject = subjectIds.map((subjectId) => {
    const own = sessions.filter((s) => s.subject_id === subjectId);
    const total = sum(own, 'total');
    const correct = sum(own, 'correct');
    return { subjectId, sessions: own.length, total, correct, pct: pctOf(correct, total) };
  });

  return {
    hasData: sessions.length > 0,
    summary: { questions: totalQuestions, pct: pctOf(totalCorrect, totalQuestions), streak },
    bySubject,
    reinforce: findReinforcement(sessions),
  };
}
