import { api } from '../core/api.js';

/** Guardados con retraso o fallidos de un perfil (más recientes primero). */
export function listSyncEvents(profileId) {
  return api.list('sync_events', { where: { profile_id: profileId }, order: 'created_at.desc', limit: 500 });
}
