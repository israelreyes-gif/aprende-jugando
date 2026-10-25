import { SUBJECTS, loadTopics } from '../../../content/registry.js';
import { listReleased } from '../../../data/release.repo.js';
import { listStudied } from '../../../data/study.repo.js';
import { courseProgress } from '../stats.logic.js';

/** Progreso de un perfil en un curso: una entrada por asignatura. */
export async function loadCourseProgress(profileId, courseId) {
  const [topicLists, releasedRows, studiedRows] = await Promise.all([
    Promise.all(SUBJECTS.map((s) => loadTopics(courseId, s.id))),
    listReleased(profileId),
    listStudied(profileId),
  ]);
  const topicsBySubject = Object.fromEntries(SUBJECTS.map((s, i) => [s.id, topicLists[i]]));
  return courseProgress(SUBJECTS.map((s) => s.id), topicsBySubject, courseId, releasedRows, studiedRows);
}
