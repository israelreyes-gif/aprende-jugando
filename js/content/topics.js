// Carga de temas. El contenido NO vive en la base de datos: son archivos de la app,
// así se versionan en GitHub y funcionan sin conexión.
//
//   content/<curso>/<asignatura>/index.js   -> lista de temas de la asignatura
//   content/<curso>/<asignatura>/<tema>.js  -> lección (study) y ejercicios (exercises)
// Los títulos de los temas NO están en la app: viven en la tabla topic_titles de D1 (data/titles.repo.js).
import { titleKey, topicTitles } from '../data/titles.repo.js';
import { fallbackTitle } from './topic-title.js';

/** Lista de temas de una asignatura. Un tema con `load` tiene contenido; sin él, es "próximamente". */
export async function loadTopics(courseId, subjectId) {
  try {
    const [module, titles] = await Promise.all([import(`./${courseId}/${subjectId}/index.js`), topicTitles()]);
    return module.topics.map((topic) => ({
      ...topic,
      title: titles.get(titleKey(courseId, subjectId, topic.id)) || fallbackTitle(topic.id),
      available: typeof topic.load === 'function',
    }));
  } catch {
    return [];
  }
}

/** Devuelve { topic, study, exercises } o null si el tema no existe o no tiene contenido. */
export async function loadTopic(courseId, subjectId, topicId) {
  const topics = await loadTopics(courseId, subjectId);
  const topic = topics.find((t) => t.id === topicId);
  if (!topic || !topic.available) return null;
  const content = await topic.load();
  return { topic, study: content.study || [], exercises: content.exercises || [] };
}
