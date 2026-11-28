import { api } from '../core/api.js';
import { uuid } from '../core/ids.js';

/** Protectores gastados de un perfil: [{ day, created_at }] (el día protegido y cuándo se usó), del más reciente al más antiguo. */
export function listShields(profileId) {
  return api.list('streak_shields', { where: { profile_id: profileId }, select: ['day', 'created_at'], order: 'day.desc', limit: 5000 });
}

/** Gasta un protector en un día pasado. Lo puede hacer el propio perfil; el Worker comprueba que se puede. */
export function addShield(profileId, day) {
  return api.insert('streak_shields', { id: uuid(), profile_id: profileId, day });
}

/** Devuelve un protector (solo los padres): el día vuelve a contar como no hecho. */
export function removeShield(profileId, day) {
  return api.remove('streak_shields', { profile_id: profileId, day });
}
