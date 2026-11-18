// Enfriamiento de avisos: el mismo fallo (misma etiqueta) avisa como mucho una vez cada 15 minutos.
// Los repetidos se cuentan y el siguiente aviso dice cuántos se callaron.
export const COOLDOWN_MS = 15 * 60 * 1000;
const KEEP_MS = 24 * 60 * 60 * 1000;

/**
 * Decide si toca avisar de `tag`. Devuelve { send, skipped }.
 * Si la base de datos falla (o aún no existe la tabla), avisa igualmente: mejor un aviso de más que ninguno.
 */
export async function claimAlert(db, tag, now = Date.now()) {
  try {
    const row = await db.prepare('SELECT last_sent, skipped FROM alert_cooldown WHERE tag = ?').bind(tag).first();
    if (row && now - Date.parse(row.last_sent) < COOLDOWN_MS) {
      await db.prepare('UPDATE alert_cooldown SET skipped = skipped + 1 WHERE tag = ?').bind(tag).run();
      return { send: false, skipped: 0 };
    }
    await db.prepare('DELETE FROM alert_cooldown WHERE last_sent < ?').bind(new Date(now - KEEP_MS).toISOString()).run();
    await db
      .prepare('INSERT INTO alert_cooldown (tag, last_sent, skipped) VALUES (?, ?, 0) ON CONFLICT(tag) DO UPDATE SET last_sent = excluded.last_sent, skipped = 0')
      .bind(tag, new Date(now).toISOString())
      .run();
    return { send: true, skipped: row?.skipped ?? 0 };
  } catch {
    return { send: true, skipped: 0 };
  }
}
