import { alertParents } from './error-alert.js';

/**
 * Cuando la app anota un guardado que no se pudo hacer ("failed"), avisa a los padres.
 * rows: filas de sync_events recibidas. Nunca lanza.
 */
export async function alertSyncFailures(env, rows) {
  try {
    const failed = (Array.isArray(rows) ? rows : [rows]).filter((r) => r && r.outcome === 'failed');
    for (const row of failed.slice(0, 3)) {
      let name = 'Un perfil';
      if (row.profile_id) {
        const profile = await env.DB.prepare('SELECT name FROM profiles WHERE id = ?').bind(String(row.profile_id)).first();
        if (profile?.name) name = profile.name;
      }
      await alertParents(env, { title: 'No se pudo guardar', where: `${name} · ${String(row.what || '').slice(0, 40)}`, detail: String(row.detail || 'sin detalle').slice(0, 80) });
    }
  } catch (err) {
    console.error('No se pudo avisar del guardado fallido', String(err?.message || err));
  }
}
