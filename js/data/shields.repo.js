import { api } from '../core/api.js';
import { uuid } from '../core/ids.js';

/** Días protegidos ('AAAA-MM-DD') de un perfil: cada uno gastó un protector de racha. */
export async function listShieldDays(profileId) {
  const rows = await api.list('streak_shields', { where: { profile_id: profileId }, select: ['day'], order: 'day.desc', limit: 5000 });
  return rows.map((row) => row.day);
}

/** Gasta un protector en un día pasado. Lo puede hacer el propio perfil; el Worker comprueba que se puede. */
export function addShield(profileId, day) {
  return api.insert('streak_shields', { id: uuid(), profile_id: profileId, day });
}

/** Devuelve un protector (solo los padres): el día vuelve a contar como no hecho. */
export function removeShield(profileId, day) {
  return api.remove('streak_shields', { profile_id: profileId, day });
}
