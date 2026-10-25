import { dayKey } from '../../../core/dates.js';
import { pctOf, sum } from './math.js';
import { findReinforcement } from './reinforcement.js';
import { ACTIVE_DAYS_WINDOW } from './thresholds.js';

/**
 * sessions: filas de practice_sessions { course_id, subject_id, topic_id, total, correct, finished_at }
 * subjectIds: ids de asignatura en el orden en que se quieren mostrar
 * now: fecha de referencia (inyectable para los tests)
 */
export function computeStats(sessions, subjectIds, now = new Date()) {
  const totalQuestions = sum(sessions, 'total');
  const totalCorrect = sum(sessions, 'correct');

  const bySubject = subjectIds.map((subjectId) => {
    const own = sessions.filter((s) => s.subject_id === subjectId);
    const total = sum(own, 'total');
    const correct = sum(own, 'correct');
    return { subjectId, sessions: own.length, total, correct, pct: pctOf(correct, total) };
  });

  const since = new Date(now);
  since.setDate(since.getDate() - ACTIVE_DAYS_WINDOW);
  const activeDays = new Set(sessions.filter((s) => new Date(s.finished_at) >= since).map((s) => dayKey(s.finished_at))).size;

  return {
    hasData: sessions.length > 0,
    summary: { questions: totalQuestions, pct: pctOf(totalCorrect, totalQuestions), activeDays },
    bySubject,
    reinforce: findReinforcement(sessions),
  };
}
