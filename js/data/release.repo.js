import { api } from '../core/api.js';
import { uuid } from '../core/ids.js';

/** Filas de los temas liberados a un perfil (opcionalmente solo de una asignatura). */
export function listReleased(profileId, { subjectId } = {}) {
  const where = { profile_id: profileId };
  if (subjectId) where.subject_id = subjectId;
  return api.list('topic_release', { where });
}

/** Libera un tema (released = true) o lo vuelve a bloquear (released = false). Liberar dos veces no duplica. */
export function setReleased({ profileId, courseId, subjectId, topicId }, released) {
  const key = { profile_id: profileId, course_id: courseId, subject_id: subjectId, topic_id: topicId };
  if (released) return api.insert('topic_release', { id: uuid(), ...key }, { conflict: 'ignore' });
  return api.remove('topic_release', key);
}
