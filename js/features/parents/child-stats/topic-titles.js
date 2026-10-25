import { loadTopics } from '../../../content/registry.js';

/** Títulos de los temas con refuerzo: Map con clave "asignatura|tema". */
export async function loadTopicTitles(reinforce) {
  const titles = new Map();
  const needed = [...new Set(reinforce.map((r) => `${r.courseId}|${r.subjectId}`))];
  await Promise.all(
    needed.map(async (key) => {
      const [courseId, subjectId] = key.split('|');
      for (const topic of await loadTopics(courseId, subjectId)) titles.set(`${subjectId}|${topic.id}`, topic.title);
    }),
  );
  return titles;
}
