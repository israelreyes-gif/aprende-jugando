import { uuid } from '../../core/ids.js';
import { savePractice } from '../practice.repo.js';
import { groupByTopic } from '../reto/group-by-topic.js';

/**
 * Guarda un mix: las respuestas de cada tema como una sesión de tipo 'mix' (así cuentan en las estadísticas de su tema).
 * Todas comparten el principio del id, que es lo que permite contarlas como una sola a efectos de puntos.
 * Devuelve { queued } (true si alguna se guardó solo en el dispositivo por falta de conexión).
 */
export async function saveMix({ profileId, courseId, answers, durationS, mixRunId = uuid() }) {
  let queued = false;
  for (const group of groupByTopic(answers)) {
    const saved = await savePractice({
      profileId, courseId, subjectId: group.subjectId, topicId: group.topicId, results: group.results,
      durationS: durationS * (group.results.length / answers.length), kind: 'mix', sessionId: `${mixRunId}:${group.subjectId}:${group.topicId}`,
    });
    queued = queued || saved.queued;
  }
  return { queued };
}
