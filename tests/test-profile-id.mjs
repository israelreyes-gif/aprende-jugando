// El id "parent" está reservado para los padres: ningún perfil puede tenerlo.
import assert from 'node:assert/strict';
import { makeD1 } from './d1-shim.js';
import worker from '../worker/worker.js';
import { createSession } from '../worker/auth-sessions.js';
import { assertProfileIds } from '../worker/profile-id.js';
import { assertProfileNames } from '../worker/profile-name.js';
import { isReservedName } from '../js/data/reserved-name.js';
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };

for (const id of ['parent', 'PARENT', 'Parent', '', 'a b', 'x'.repeat(65), 'a/b', "x'--", 7, null, {}]) assert.throws(() => assertProfileIds([{ id }]), (e) => e.status === 400, String(id));
for (const id of ['nuevo', 'alex', crypto.randomUUID(), 'id-lx3k9-ab12cd34', 'parent2', 'my-parent']) assertProfileIds([{ id }]);
assertProfileIds([{ name: 'sin id' }]); assertProfileIds([]); ok('se rechaza "parent" (en cualquier mayúscula) y los ids raros; valen los UUID, los ids normales y los ya existentes');

const db = makeD1(new URL('../worker/schema.sql', import.meta.url).pathname); const env = { DB: db, API_KEY: 'k' };
const parent = await createSession(db, 'parent');
const call = async (method, path, body) => worker.fetch(new Request(`http://w${path}`, { method, headers: { 'X-Api-Key': 'k', 'X-Session': parent, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }), env);
assert.equal((await call('POST', '/api/profiles', { id: 'parent', name: 'Falso', avatar_color: '#000' })).status, 400);
assert.equal((await call('POST', '/api/profiles', [{ id: 'ok1', name: 'A', avatar_color: '#000' }, { id: 'Parent', name: 'B', avatar_color: '#000' }])).status, 400);
assert.equal(db.sqlite.prepare("SELECT COUNT(*) c FROM profiles").get().c, 0); ok('POST /api/profiles con "parent" (suelto o dentro de un lote): 400 y no se crea nada');
assert.equal((await call('POST', '/api/profiles', { id: crypto.randomUUID(), name: 'Bien', avatar_color: '#00f' })).status, 201); ok('un perfil normal se crea');
const id = db.sqlite.prepare('SELECT id FROM profiles').get().id;
assert.equal((await call('PATCH', `/api/profiles/${id}`, { id: 'parent' })).status, 400);
assert.equal((await call('PATCH', `/api/profiles/${id}`, { name: 'Otro' })).status, 200); ok('no se puede renombrar un perfil a "parent", pero sí cambiarle el nombre');

// El nombre 'parent' tampoco se puede usar (en la app y en el Worker)
for (const name of ['parent', 'Parent', 'PARENT', '  parent  ']) { assert.equal(isReservedName(name), true, name); assert.throws(() => assertProfileNames([{ name }]), (e) => e.status === 400, name); }
for (const name of [5, null, ['a'], {}]) assert.throws(() => assertProfileNames([{ name }]), (e) => e.status === 400, 'nombre que no es texto');
for (const name of ['Alex', 'Parents', 'my parent', 'Padres', '', undefined]) { assert.equal(isReservedName(name), false, String(name)); assertProfileNames([{ name }]); }
ok('el nombre "parent" se rechaza (cualquier mayúscula, con espacios); "Parents", "Padres" y "my parent" valen');
assert.equal((await call('POST', '/api/profiles', { id: crypto.randomUUID(), name: ' Parent ', avatar_color: '#000' })).status, 400);
assert.equal((await call('PATCH', `/api/profiles/${id}`, { name: 'PARENT' })).status, 400);
assert.equal((await call('PATCH', `/api/profiles/${id}`, { name: 'Alex' })).status, 200); ok('el Worker rechaza crear o renombrar un perfil como "parent"');
console.log(`\n${n} comprobaciones OK`);
