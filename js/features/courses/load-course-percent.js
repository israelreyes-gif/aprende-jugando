import { COURSES } from '../../content/registry.js';
import { loadCourseProgress } from '../parents/child-stats/load-course-progress.js';
import { coursePercent } from './course-percent.js';

/** Porcentaje del curso de un perfil, o null si no se pudo leer o no hay temas. courseId: por defecto, el curso abierto. */
export async function loadCoursePercentOrNull(profileId, courseId) {
  try {
    const id = courseId || (COURSES.find((c) => c.available) || {}).id;
    if (!id) return null;
    const percent = coursePercent(await loadCourseProgress(profileId, id));
    return percent.total === 0 ? null : percent;
  } catch (err) {
    console.warn('No se pudo leer el progreso del curso', err);
    return null;
  }
}
