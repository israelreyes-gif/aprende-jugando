import { listReleased } from '../../data/release.repo.js';

/** Qué decirle al niño cuando no hay temas para el reto: o no hay liberados, o no ha estudiado ninguno. */
export async function retoEmptyText(profileId, courseId) {
  const released = (await listReleased(profileId)).some((row) => row.course_id === courseId);
  return released
    ? 'Estudia primero algún tema liberado para desbloquear el reto.'
    : 'Todavía no hay temas liberados para el reto. Pídele a tus padres que liberen algunos.';
}
