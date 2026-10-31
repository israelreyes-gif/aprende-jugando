import { loadCourseProgress } from '../parents/child-stats/load-course-progress.js';
import { coursePercent } from './course-percent.js';

/** Porcentaje del curso de un perfil, o null si no se pudo leer o no hay temas.  */
export async function loadCoursePercentOrNull(profileId, courseId) {
  try {
    if (!courseId) return null;
    const percent = coursePercent(await loadCourseProgress(profileId, courseId));
    return percent.total === 0 ? null : percent;
  } catch (err) {
    console.warn('No se pudo leer el progreso del curso', err);
    return null;
  }
}
