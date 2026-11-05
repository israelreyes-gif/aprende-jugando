import { HttpError } from './http.js';

/**
 * `?conflict=replace` sustituye la fila que ya tenga ese id, sea de quien sea. Un perfil solo puede usarlo
 * en sus propios móviles de avisos (push_devices) y solo para sustituir uno suyo: si no, podría pisar o robar
 * las filas de otro perfil (o el móvil de los padres) mandando su id con su propio profile_id.
 */
export async function assertReplaceAllowed(db, owner, table, params, rows) {
  if (params.get('conflict') !== 'replace') return;
  if (table.name !== 'push_devices') throw new HttpError(403, 'Operación no permitida');
  for (const row of rows) {
    const existing = await db.prepare('SELECT profile_id FROM push_devices WHERE id = ?').bind(String(row.id)).first();
    if (existing && existing.profile_id !== owner) throw new HttpError(403, 'Operación no permitida');
  }
}
