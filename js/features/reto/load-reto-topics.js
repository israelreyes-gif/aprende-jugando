import { SUBJECTS, loadTopics } from '../../content/registry.js';
import { listReleased } from '../../data/release.repo.js';
import { listStudied } from '../../data/study.repo.js';

/**
 * Temas de un curso que entran en el reto: liberados para el perfil, estudiados y con ejercicios.
 * Así el reto solo pregunta lo que ya ha estudiado.
 * Devuelve [{ subjectId, topicId, title, exercises }].
 */
export async function loadRetoTopics(profileId, courseId) {
  const [releasedRows, studiedRows] = await Promise.all([listReleased(profileId), listStudied(profileId)]);
  const inCourse = (rows, subjectId, topicId) => rows.some((row) => row.course_id === courseId && row.subject_id === subjectId && row.topic_id === topicId);

  const bySubject = await Promise.all(
    SUBJECTS.map(async (subject) => {
      const topics = (await loadTopics(courseId, subject.id)).filter(
        (topic) => topic.available && inCourse(releasedRows, subject.id, topic.id) && inCourse(studiedRows, subject.id, topic.id),
      );
      const loaded = await Promise.all(topics.map(async (topic) => ({ subjectId: subject.id, topicId: topic.id, title: topic.title, exercises: (await topic.load()).exercises || [] })));
      return loaded.filter((topic) => topic.exercises.length > 0);
    }),
  );
  return bySubject.flat();
}
