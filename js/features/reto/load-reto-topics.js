import { SUBJECTS, loadTopics } from '../../content/registry.js';
import { listReleased } from '../../data/release.repo.js';

/**
 * Temas de un curso que entran en el reto: liberados para el perfil y con ejercicios.
 * Devuelve [{ subjectId, topicId, title, exercises }].
 */
export async function loadRetoTopics(profileId, courseId) {
  const released = (await listReleased(profileId)).filter((row) => row.course_id === courseId);
  const bySubject = await Promise.all(
    SUBJECTS.map(async (subject) => {
      const topics = (await loadTopics(courseId, subject.id)).filter(
        (topic) => topic.available && released.some((row) => row.subject_id === subject.id && row.topic_id === topic.id),
      );
      const loaded = await Promise.all(topics.map(async (topic) => ({ subjectId: subject.id, topicId: topic.id, title: topic.title, exercises: (await topic.load()).exercises || [] })));
      return loaded.filter((topic) => topic.exercises.length > 0);
    }),
  );
  return bySubject.flat();
}
