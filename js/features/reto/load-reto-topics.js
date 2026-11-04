import { getCourse, subjectsOf, loadTopics } from '../../content/registry.js';
import { listReleased } from '../../data/release.repo.js';
import { listStudied } from '../../data/study.repo.js';

/**
 * Temas de un curso que entran en el reto: liberados para el perfil, estudiados y con ejercicios.
 * Así el reto solo pregunta lo que ya ha estudiado.
 * Devuelve [{ subjectId, topicId, title, exercises }].
 */
export async function loadRetoTopics(profileId, courseId) {
  // Todo lo que va a la red se pide a la vez: liberados, estudiados y la lista de temas de cada asignatura
  const subjects = subjectsOf(getCourse(courseId));
  const [releasedRows, studiedRows, topicLists] = await Promise.all([
    listReleased(profileId),
    listStudied(profileId),
    Promise.all(subjects.map((subject) => loadTopics(courseId, subject.id))),
  ]);
  const inCourse = (rows, subjectId, topicId) => rows.some((row) => row.course_id === courseId && row.subject_id === subjectId && row.topic_id === topicId);

  const bySubject = await Promise.all(
    subjects.map(async (subject, i) => {
      const topics = topicLists[i].filter(
        (topic) => topic.available && inCourse(releasedRows, subject.id, topic.id) && inCourse(studiedRows, subject.id, topic.id),
      );
      const loaded = await Promise.all(topics.map(async (topic) => ({ subjectId: subject.id, topicId: topic.id, title: topic.title, exercises: (await topic.load()).exercises || [] })));
      return loaded.filter((topic) => topic.exercises.length > 0);
    }),
  );
  return bySubject.flat();
}
