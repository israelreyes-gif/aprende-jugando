import { mixTopics } from '../../content/mixes.js';
import { listReleased } from '../../data/release.repo.js';
import { listStudied } from '../../data/study.repo.js';

/**
 * Temas de los que salen las preguntas del mix: los de su unidad que están liberados y estudiados y tienen ejercicios.
 * Devuelve [{ subjectId, topicId, title, exercises }].
 */
export async function loadMixPool(profileId, courseId, subjectId, mix) {
  const [topics, released, studied] = await Promise.all([mixTopics(courseId, subjectId, mix), listReleased(profileId, { subjectId }), listStudied(profileId, { subjectId })]);
  const has = (rows, topic) => rows.some((row) => row.course_id === courseId && row.topic_id === topic.id);
  const eligible = topics.filter((topic) => has(released, topic) && has(studied, topic));
  const loaded = await Promise.all(eligible.map(async (topic) => ({ subjectId, topicId: topic.id, title: topic.title, exercises: (await topic.load()).exercises || [] })));
  return loaded.filter((topic) => topic.exercises.length > 0);
}
