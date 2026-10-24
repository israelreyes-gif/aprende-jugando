import { api } from '../core/api.js';
import { uuid } from '../core/ids.js';

export function listProfiles() {
  return api.list('profiles', { order: 'created_at.asc' });
}

export function getProfile(id) {
  return api.get('profiles', id);
}

export async function createProfile({ name, color }) {
  const profile = { id: uuid(), name: name.trim(), avatar_color: color };
  await api.insert('profiles', profile);
  return profile;
}

/** Borra el perfil y, en cascada, todo su progreso. */
export function deleteProfile(id) {
  return api.remove('profiles', { id });
}
