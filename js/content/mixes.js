// Mixes de preguntas de una asignatura: cada uno mezcla los temas de una unidad (o de toda la asignatura si no tiene `unit`).
// Se declaran en el índice de la asignatura: export const mixes = [{ id, unit, emoji, title, size }].
import { loadTopics } from './topics.js';

export async function loadMixes(courseId, subjectId) {
  try {
    return (await import(`./${courseId}/${subjectId}/index.js`)).mixes || [];
  } catch {
    return [];
  }
}

export async function findMix(courseId, subjectId, mixId) {
  return (await loadMixes(courseId, subjectId)).find((mix) => mix.id === mixId) || null;
}

/** Temas que entran en un mix: los de su unidad (todos si no tiene), menos los marcados con inMix: false. */
export async function mixTopics(courseId, subjectId, mix) {
  const topics = await loadTopics(courseId, subjectId);
  return topics.filter((topic) => topic.available && topic.inMix !== false && (!mix.unit || topic.unit === mix.unit));
}
