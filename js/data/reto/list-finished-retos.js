import { api } from '../../core/api.js';

/** Retos terminados del perfil: [{ id, day }]. Sirve para sumar la racha a los puntos de cada reto. */
export async function listFinishedRetos(profileId) {
  const rows = await api.list('reto_diario', { where: { profile_id: profileId }, select: ['id', 'day', 'finished_at'], limit: 5000 });
  return rows.filter((row) => row.finished_at).map(({ id, day }) => ({ id, day }));
}
