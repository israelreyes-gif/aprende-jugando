import { api } from '../core/api.js';
import { uuid } from '../core/ids.js';
import { fetchProfiles } from './auth.repo.js';

/** Todos los perfiles (datos públicos: sin entrar). */
export function listProfiles() {
  return fetchProfiles();
}

export function getProfile(id) {
  return api.get('profiles', id);
}

export async function createProfile({ name, color, gender, courseId }) {
  const profile = { id: uuid(), name: name.trim(), avatar_color: color, gender: gender || null, course_id: courseId || null };
  await api.insert('profiles', profile);
  return profile;
}

/** Cambia el nombre, el color, si es chico o chica y si pide el código cada vez (askAlways, opcional). */
export async function updateProfile(id, { name, color, gender, askAlways }) {
  const patch = { name: name.trim(), avatar_color: color, gender: gender || null };
  if (askAlways !== undefined) patch.ask_always = askAlways ? 1 : 0;
  await api.update('profiles', { id }, patch);
}

/** Borra el perfil y, en cascada, todo su progreso. */
export function deleteProfile(id) {
  return api.remove('profiles', { id });
}

/** Guarda el curso que estudia el perfil (se elige una vez). */
export async function setProfileCourse(id, courseId) {
  await api.update('profiles', { id }, { course_id: courseId });
}
