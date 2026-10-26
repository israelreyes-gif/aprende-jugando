import { withSeed } from '../../../core/seeded.js';
import { materialize } from '../../../exercises/session.js';

/**
 * Convierte el plan del reto en preguntas listas para mostrar.
 * Con la misma semilla un generador crea siempre la misma pregunta, así se puede retomar el reto.
 * Si un ejercicio ya no existe (cambió el contenido), se salta.
 * Cada pregunta lleva subjectId y topicId para guardar el resultado en su tema.
 */
export function materializePlan(plan, topics) {
  return plan.flatMap((entry) => {
    const topic = topics.find((t) => t.subjectId === entry.subjectId && t.topicId === entry.topicId);
    const item = topic?.exercises.find((e) => e.id === entry.exerciseId);
    if (!item) return [];
    const question = withSeed(entry.seed, () => materialize(item));
    return [{ ...question, subjectId: entry.subjectId, topicId: entry.topicId }];
  });
}
