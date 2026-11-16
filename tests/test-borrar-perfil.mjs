// Al borrar un perfil se van también su código y sus sesiones (disparador trg_profile_delete).
import assert from 'node:assert/strict';
import { makeD1 } from './d1-shim.js';
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname);
const run = (s, ...a) => db.sqlite.prepare(s).run(...a); const get = (s, ...a) => db.sqlite.prepare(s).get(...a);
const cols = db.sqlite.prepare("PRAGMA table_info(profiles)").all().filter((c) => c.notnull && c.dflt_value == null && c.name !== 'id').map((c) => c.name);
for (const id of ['a', 'b']) {
  run(`INSERT INTO profiles (id${cols.map((c) => ', ' + c).join('')}) VALUES (?${cols.map(() => ", 'x'").join('')})`, id);
  run("INSERT INTO credentials (owner, salt, hash) VALUES (?, 's', 'h')", id);
  run("INSERT INTO sessions (token_hash, owner) VALUES (?, ?)", 't' + id, id);
}
run("INSERT INTO credentials (owner, salt, hash) VALUES ('parent', 's', 'h')");
run("DELETE FROM profiles WHERE id = 'a'");
assert.equal(get("SELECT COUNT(*) n FROM credentials WHERE owner = 'a'").n, 0);
assert.equal(get("SELECT COUNT(*) n FROM sessions WHERE owner = 'a'").n, 0);
console.log('  ✓ borrar un perfil borra su código y sus sesiones');
assert.equal(get("SELECT COUNT(*) n FROM credentials WHERE owner IN ('b','parent')").n, 2);
assert.equal(get("SELECT COUNT(*) n FROM sessions WHERE owner = 'b'").n, 1);
console.log('  ✓ los demás perfiles y los padres no se tocan');
