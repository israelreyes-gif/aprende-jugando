import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

/** Imita la API de D1 (prepare/bind/all/first/run/batch) sobre SQLite real. */
export function makeD1(schemaPath) {
  // Las pruebas cambian la base «por detrás» de la app: se avisa a la caché en memoria (ver core/api/memory-cache.js).
  const hooks = (globalThis.__AJ_TEST_HOOKS ||= { clear: new Set() });
  const raw = new DatabaseSync(':memory:');
  const forget = () => hooks.clear.forEach((fn) => fn());
  const sqlite = {
    exec: (sql) => { forget(); return raw.exec(sql); },
    prepare: (sql) => {
      const st = raw.prepare(sql);
      return { all: (...a) => st.all(...a), get: (...a) => st.get(...a), run: (...a) => { forget(); return st.run(...a); } };
    },
  };
  sqlite.exec('PRAGMA foreign_keys = ON;');
  sqlite.exec(fs.readFileSync(schemaPath, 'utf8'));

  const prepare = (sql) => ({
    args: [],
    bind(...a) { this.args = a; return this; },
    async all() { return { results: sqlite.prepare(sql).all(...this.args).map((r) => ({ ...r })), success: true, meta: {} }; },
    async first() { const r = sqlite.prepare(sql).get(...this.args); return r ? { ...r } : null; },
    async run() { const r = sqlite.prepare(sql).run(...this.args); return { success: true, meta: { changes: Number(r.changes) } }; },
  });

  return {
    sqlite,
    prepare,
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {
        const out = [];
        for (const s of statements) out.push(await s.run());
        sqlite.exec('COMMIT');
        return out;
      } catch (err) {
        sqlite.exec('ROLLBACK');
        throw err;
      }
    },
  };
}
