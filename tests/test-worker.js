import assert from 'node:assert/strict';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';

const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname);
const env = { DB: db, API_KEY: 'secreto', ALLOWED_ORIGIN: 'https://yo.github.io' };

async function call(method, path, { body, key = 'secreto', origin } = {}) {
  const headers = {};
  if (key) headers['X-Api-Key'] = key;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (origin) headers.Origin = origin;
  const res = await worker.fetch(new Request(`https://w.example${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined }), env);
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null, headers: res.headers };
}

let passed = 0;
const ok = (name) => { passed++; console.log('  ✓', name); };

// Auth
assert.equal((await call('GET', '/api', { key: '' })).status, 401); ok('sin clave -> 401');
assert.equal((await call('GET', '/api', { key: 'mala' })).status, 401); ok('clave mala -> 401');
const root = await call('GET', '/api');
assert.equal(root.status, 200);
assert.deepEqual(root.data.tables.sort(), ['answers', 'practice_sessions', 'profiles', 'push_devices', 'reto_diario', 'settings', 'study_progress', 'topic_release']); ok('lista las 8 tablas del esquema');

// CORS
const pre = await call('OPTIONS', '/api/profiles', { key: '', origin: 'https://yo.github.io' });
assert.equal(pre.status, 204);
assert.equal(pre.headers.get('Access-Control-Allow-Headers'), 'Content-Type, X-Api-Key'); ok('preflight CORS');
const withOrigin = await call('GET', '/api', { origin: 'https://yo.github.io' });
assert.equal(withOrigin.headers.get('Access-Control-Allow-Origin'), 'https://yo.github.io');
const badOrigin = await call('GET', '/api', { origin: 'https://malo.com' });
assert.equal(badOrigin.headers.get('Access-Control-Allow-Origin'), null); ok('origen no permitido no recibe CORS');

// Perfiles: CRUD
let r = await call('POST', '/api/profiles', { body: { id: 'p1', name: 'Alex', avatar_color: '#FFC53D' } });
assert.equal(r.status, 201); assert.equal(r.data.count, 1); ok('POST perfil');
await call('POST', '/api/profiles', { body: { id: 'p2', name: 'Lucía', avatar_color: '#8EDBC0' } });
r = await call('GET', '/api/profiles?order=name.desc');
assert.deepEqual(r.data.map((p) => p.id), ['p2', 'p1']); ok('GET con order');
r = await call('GET', '/api/profiles/p1');
assert.equal(r.data.name, 'Alex'); assert.ok(r.data.created_at); ok('GET por id, con created_at por defecto');
assert.equal((await call('GET', '/api/profiles/nope')).status, 404); ok('GET id inexistente -> 404');
r = await call('GET', '/api/profiles?name=eq.Alex'); assert.equal(r.data.length, 1); ok('filtro eq');
r = await call('GET', '/api/profiles?id=in.p1,p2&select=id,name'); assert.equal(r.data.length, 2); assert.deepEqual(Object.keys(r.data[0]), ['id', 'name']); ok('filtro in + select');
r = await call('GET', '/api/profiles?name=like.Al%25'); assert.equal(r.data.length, 1); ok('filtro like');
r = await call('GET', '/api/profiles?limit=1&offset=1&order=id.asc'); assert.equal(r.data[0].id, 'p2'); ok('limit/offset');
r = await call('PATCH', '/api/profiles/p1', { body: { name: 'Alejandro' } }); assert.equal(r.data.count, 1);
assert.equal((await call('GET', '/api/profiles/p1')).data.name, 'Alejandro'); ok('PATCH por id');

// Validaciones y seguridad
assert.equal((await call('POST', '/api/profiles', { body: { id: 'p3', nombre: 'x', avatar_color: '#fff' } })).status, 400); ok('columna desconocida -> 400');
assert.equal((await call('GET', '/api/profiles?foo=eq.1')).status, 400); ok('filtro por columna desconocida -> 400');
assert.equal((await call('GET', '/api/profiles?name=Alex')).status, 400); ok('filtro sin operador -> 400');
assert.equal((await call('GET', '/api/profiles?order=name;drop')).status, 400); ok('order inválido -> 400');
assert.equal((await call('GET', '/api/nada')).status, 404); ok('tabla desconocida -> 404');
assert.equal((await call('GET', '/api/sqlite_master')).status, 404); ok('tablas internas no expuestas');
r = await call('GET', `/api/profiles?name=eq.${encodeURIComponent("x' OR '1'='1")}`); assert.equal(r.data.length, 0); ok('inyección en valor es inofensiva');
r = await call('GET', `/api/profiles?${encodeURIComponent('name" OR 1=1 --')}=eq.x`); assert.equal(r.status, 400); ok('inyección en nombre de columna -> 400');
assert.equal((await call('POST', '/api/profiles', { body: { id: 'p9', name: '', avatar_color: '#fff' } })).status, 400); ok('CHECK (nombre vacío) -> 400');
assert.equal((await call('POST', '/api/profiles', { body: { id: 'p1', name: 'Dup', avatar_color: '#fff' } })).status, 409); ok('id duplicado -> 409');
assert.equal((await call('DELETE', '/api/profiles')).status, 400); ok('DELETE sin filtro -> 400');
assert.equal((await call('PATCH', '/api/profiles', { body: { name: 'x' } })).status, 400); ok('PATCH sin filtro -> 400');

// Sesiones y respuestas
const session = { id: 's1', profile_id: 'p1', course_id: '4-primaria', subject_id: 'mates', topic_id: 'tablas', total: 8, correct: 5, duration_s: 90, finished_at: '2026-10-24T10:00:00.000Z' };
r = await call('POST', '/api/practice_sessions', { body: session }); assert.equal(r.status, 201); ok('POST sesión');
assert.equal((await call('POST', '/api/practice_sessions', { body: { ...session, id: 's2', correct: 9 } })).status, 400); ok('CHECK correct <= total');
assert.equal((await call('POST', '/api/practice_sessions', { body: { ...session, id: 's3', profile_id: 'fantasma' } })).status, 409); ok('FK: perfil inexistente -> 409');
r = await call('POST', '/api/practice_sessions?conflict=ignore', { body: session }); assert.equal(r.data.count, 0); ok('conflict=ignore es idempotente');

const answers = Array.from({ length: 8 }, (_, i) => ({ id: `a${i}`, session_id: 's1', question_id: `tablas:q${i}`, is_correct: i < 5 ? 1 : 0, given: String(i) }));
r = await call('POST', '/api/answers', { body: answers }); assert.equal(r.data.count, 8); ok('POST en lote (8 respuestas)');
r = await call('GET', '/api/answers?session_id=eq.s1&is_correct=eq.0'); assert.equal(r.data.length, 3); ok('filtros combinados');
const bad = [{ id: 'z1', session_id: 's1', question_id: 'x', is_correct: 1 }, { id: 'z2', session_id: 'fantasma', question_id: 'x', is_correct: 1 }];
assert.equal((await call('POST', '/api/answers', { body: bad })).status, 409);
assert.equal((await call('GET', '/api/answers?id=eq.z1')).data.length, 0); ok('el lote es atómico (todo o nada)');

// Estudio con UNIQUE
const study = { id: 'st1', profile_id: 'p1', course_id: '4-primaria', subject_id: 'mates', topic_id: 'tablas', completed_at: '2026-10-24T10:05:00.000Z' };
await call('POST', '/api/study_progress?conflict=ignore', { body: study });
r = await call('POST', '/api/study_progress?conflict=ignore', { body: { ...study, id: 'st2' } }); assert.equal(r.data.count, 0);
assert.equal((await call('GET', '/api/study_progress')).data.length, 1); ok('UNIQUE evita temas estudiados duplicados');

// Settings con replace
await call('POST', '/api/settings?conflict=replace', { body: { key: 'parent_pin', value: 'a:b' } });
await call('POST', '/api/settings?conflict=replace', { body: { key: 'parent_pin', value: 'c:d' } });
assert.equal((await call('GET', '/api/settings/key')).status, 404);
assert.equal((await call('GET', '/api/settings/parent_pin')).data.value, 'c:d'); ok('settings: replace y lectura por clave');

// Móviles con avisos (push)
r = await call('POST', '/api/push_devices', { body: { id: 'd1', kind: 'child', profile_id: 'p1', endpoint: 'https://push.example/a', p256dh: 'k1', auth: 'a1' } });
assert.equal(r.status, 201);
r = await call('POST', '/api/push_devices', { body: { id: 'd2', kind: 'parent', endpoint: 'https://push.example/b', p256dh: 'k2', auth: 'a2' } });
assert.equal(r.status, 201); ok('push_devices: un móvil de niño y uno de padres');
r = await call('POST', '/api/push_devices', { body: { id: 'd3', kind: 'parent', endpoint: 'https://push.example/a', p256dh: 'k', auth: 'a' } });
assert.equal(r.status, 201); ok('push_devices: el mismo móvil puede ser de un perfil y de los padres');
r = await call('POST', '/api/push_devices', { body: { id: 'd3', kind: 'parent', endpoint: 'https://push.example/a', p256dh: 'k', auth: 'a' } });
assert.ok(r.status >= 400, 'mismo id no se duplica'); ok('push_devices: mismo id rechazado');
r = await call('POST', '/api/push_devices', { body: { id: 'd4', kind: 'otro', endpoint: 'https://push.example/c', p256dh: 'k', auth: 'a' } });
assert.ok(r.status >= 400, 'kind inválido'); ok('push_devices: tipo inválido rechazado');
r = await call('POST', '/api/push_devices?conflict=replace', { body: { id: 'd1', kind: 'child', profile_id: 'p1', endpoint: 'https://push.example/a', p256dh: 'k9', auth: 'a9' } });
assert.equal(r.status, 201);
assert.equal((await call('GET', '/api/push_devices?endpoint=eq.https://push.example/a')).data.length, 2);
assert.equal((await call('GET', '/api/push_devices/d1')).data.p256dh, 'k9'); ok('push_devices: volver a activar lo mismo reemplaza, sin duplicar');

// Cascada al borrar un perfil
r = await call('DELETE', '/api/profiles/p1'); assert.equal(r.data.count, 1);
assert.equal((await call('GET', '/api/practice_sessions')).data.length, 0);
assert.equal((await call('GET', '/api/answers')).data.length, 0);
assert.equal((await call('GET', '/api/study_progress')).data.length, 0); ok('borrar perfil borra en cascada sesiones, respuestas y estudio');
const left = (await call('GET', '/api/push_devices')).data;
assert.equal(left.length, 2); assert.ok(left.every((d) => d.kind === 'parent')); ok('borrar perfil borra sus móviles, no los de padres');

// Esquema dinámico: una tabla nueva aparece sin tocar el Worker
db.sqlite.exec('CREATE TABLE premios (id TEXT PRIMARY KEY, nombre TEXT NOT NULL)');
// la caché del esquema dura 60 s; simulamos que ha caducado
const realNow = Date.now; Date.now = () => realNow() + 61_000;
r = await call('POST', '/api/premios', { body: { id: 'x', nombre: 'Estrella' } });
Date.now = realNow;
assert.equal(r.status, 201); ok('tablas nuevas se descubren solas');

console.log(`\n${passed} comprobaciones del Worker OK`);
