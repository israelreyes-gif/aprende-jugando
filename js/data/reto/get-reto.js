import { api } from '../../core/api.js';
import { parseRetoRow } from './reto-row.js';

/** El reto de un perfil en un día ('AAAA-MM-DD'), o null si aún no se ha creado. */
export async function getReto(profileId, day) {
  const rows = await api.list('reto_diario', { where: { profile_id: profileId, day }, limit: 1 });
  return parseRetoRow(rows[0]);
}
