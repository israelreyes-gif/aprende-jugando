import { api } from '../../core/api.js';
import { savePractice } from '../practice.repo.js';
import { groupByTopic } from './group-by-topic.js';

/**
 * Cierra el reto: guarda las respuestas de cada tema como una sesión de tipo 'reto' (así cuentan en las
 * estadísticas de su tema) y marca el reto como terminado. Se puede repetir sin duplicar nada.
 */
export async function finishReto(reto) {
  for (const group of groupByTopic(reto.answers)) {
    await savePractice({
      profileId: reto.profileId,
      courseId: reto.courseId,
      subjectId: group.subjectId,
      topicId: group.topicId,
      results: group.results,
      durationS: 0,
      kind: 'reto',
      sessionId: `${reto.id}:${group.subjectId}:${group.topicId}`,
    });
  }
  await api.update('reto_diario', { id: reto.id }, { finished_at: new Date().toISOString() });
}
