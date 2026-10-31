import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

/** Imita la API de D1 (prepare/bind/all/first/run/batch) sobre SQLite real. */
export function makeD1(schemaPath) {
  const sqlite = new DatabaseSync(':memory:');
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
