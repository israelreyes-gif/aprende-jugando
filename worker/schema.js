const SCHEMA_TTL_MS = 60_000;
let cache = { at: 0, tables: null };

/** Entrecomilla un nombre de tabla o columna para usarlo en SQL. */
export const q = (identifier) => `"${String(identifier).replace(/"/g, '""')}"`;

/** Descubre las tablas y columnas de D1 (se recuerdan 1 minuto). */
export async function loadSchema(db) {
  if (cache.tables && Date.now() - cache.at < SCHEMA_TTL_MS) return cache.tables;

  const { results: tableRows } = await db
    .prepare(
      `SELECT name FROM sqlite_master
       WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'd1_%'
       ORDER BY name`,
    )
    .all();

  const tables = {};
  for (const { name } of tableRows) {
    const { results: info } = await db.prepare(`PRAGMA table_info(${q(name)})`).all();
    tables[name] = {
      name,
      columns: info.map((c) => c.name),
      pk: info.filter((c) => c.pk > 0).sort((a, b) => a.pk - b.pk).map((c) => c.name),
    };
  }
  cache = { at: Date.now(), tables };
  return tables;
}
