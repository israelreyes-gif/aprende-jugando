import { api } from '../../core/api.js';
import { uuid } from '../../core/ids.js';
import { getReto } from './get-reto.js';

/**
 * Crea el reto del día con su plan. Si ya existía (por ejemplo desde otro dispositivo), no lo pisa:
 * devuelve el que había. Siempre devuelve el reto que vale para ese día.
 */
export async function startReto({ profileId, courseId, day, plan }) {
  await api.insert(
    'reto_diario',
    { id: uuid(), profile_id: profileId, course_id: courseId, day, questions: JSON.stringify(plan), answers: '[]' },
    { conflict: 'ignore' },
  );
  return getReto(profileId, day);
}
