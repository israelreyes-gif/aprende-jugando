import { api } from '../../core/api.js';

/** Días ('AAAA-MM-DD') en los que el perfil terminó el reto. */
export async function listRetoDays(profileId) {
  const rows = await api.list('reto_diario', { where: { profile_id: profileId }, select: ['day', 'finished_at'], limit: 5000 });
  return rows.filter((row) => row.finished_at).map((row) => row.day);
}
