import { api } from '../../core/api.js';

/** Guarda lo respondido hasta ahora en el reto. answers: [{ questionId, subjectId, topicId, correct, given, prompt, answerText }]. */
export function saveRetoAnswers(retoId, answers) {
  return api.update('reto_diario', { id: retoId }, { answers: JSON.stringify(answers) });
}
