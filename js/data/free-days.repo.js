import { api } from '../core/api.js';
import { uuid } from '../core/ids.js';

/** Días libres ('AAAA-MM-DD') de un perfil: días en que el reto no se exige. */
export async function listFreeDays(profileId) {
  const rows = await api.list('free_days', { where: { profile_id: profileId }, select: ['day'], order: 'day.desc', limit: 5000 });
  return rows.map((row) => row.day);
}

/** Marca un día como libre. Marcar dos veces el mismo día no lo duplica. */
export function addFreeDay(profileId, day) {
  return api.insert('free_days', { id: uuid(), profile_id: profileId, day }, { conflict: 'ignore' });
}

/** Quita un día libre. */
export function removeFreeDay(profileId, day) {
  return api.remove('free_days', { profile_id: profileId, day });
}
