// Seguridad del Worker: sin clave o con clave mala no se entra, las peticiones raras se rechazan
// y los errores no cuentan nada interno al cliente.
import assert from 'node:assert/strict';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';

const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname);
const env = { DB: db, API_KEY: 'secreto', ALLOWED_ORIGIN: 'https://yo.github.io' };
const SECRETO_INTERNO = 'tabla_secreta_xyz';

async function call(method, path, { key = 'secreto', body, rawBody, environment = env } = {}) {
  const headers = {};
  if (key !== null) headers['X-Api-Key'] = key;
  if (body !== undefined || rawBody !== undefined) headers['Content-Type'] = 'application/json';
  const init = { method, headers, body: rawBody ?? (body !== undefined ? JSON.stringify(body) : undefined) };
  const res = await worker.fetch(new Request(`https://w.example${path}`, init), environment, { waitUntil() {} });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: res.status, data, text };
}

let passed = 0;
const ok = (name) => { passed++; console.log('  ✓', name); };

// Sin clave o con clave mala: ninguna ruta responde datos.
for (const [method, path] of [['GET', '/api'], ['GET', '/api/profiles'], ['POST', '/api/profiles'], ['DELETE', '/api/profiles'], ['POST', '/push/send'], ['GET', '/push/vapid-public-key']]) {
  assert.equal((await call(method, path, { key: null })).status, 401, `${method} ${path} sin clave`);
  assert.equal((await call(method, path, { key: 'mala' })).status, 401, `${method} ${path} clave mala`);
}
ok('sin clave o con clave incorrecta -> 401 en todas las rutas');
assert.equal((await call('GET', '/api', { key: '' })).status, 401);
assert.equal((await call('GET', '/api', { key: 'secret' })).status, 401);
assert.equal((await call('GET', '/api', { key: 'secretoo' })).status, 401);
assert.equal((await call('GET', '/api', { key: 'SECRETO' })).status, 401); ok('claves parecidas, vacía o de otra longitud -> 401');

// El Worker mal configurado no deja pasar a nadie.
assert.equal((await call('GET', '/api', { environment: { DB: db } })).status, 500);
assert.equal((await call('GET', '/api', { key: '', environment: { DB: db, API_KEY: '' } })).status, 500); ok('sin API_KEY configurada nadie entra');

// Peticiones raras
assert.equal((await call('PUT', '/api/profiles')).status, 405); ok('método no permitido -> 405');
assert.equal((await call('GET', '/otra-ruta')).status, 404); ok('ruta desconocida -> 404');
assert.equal((await call('GET', '/api/profiles/a/b')).status, 404); ok('ruta demasiado larga -> 404');
assert.equal((await call('POST', '/api/profiles', { rawBody: '{no es json' })).status, 400); ok('cuerpo que no es JSON -> 400');
assert.equal((await call('POST', '/api/profiles', { body: [1, 2, 3] })).status >= 400, true); ok('cuerpo que no es un objeto -> error');
assert.equal((await call('GET', `/api/${encodeURIComponent('profiles; DROP TABLE profiles')}`)).status, 404); ok('nombre de tabla con SQL -> 404');
assert.equal((await call('GET', '/api/profiles?limit=abc')).status < 500, true);
assert.equal((await call('GET', '/api/profiles?limit=99999999')).status < 500, true); ok('límites raros no rompen el Worker');

// Los errores no cuentan nada interno.
await call('POST', '/api/profiles', { body: { id: 'p1', name: 'Alex', avatar_color: '#fff' } });
const dup = await call('POST', '/api/profiles', { body: { id: 'p1', name: 'Dup', avatar_color: '#fff' } });
assert.equal(dup.status, 409);
assert.deepEqual(Object.keys(dup.data), ['error']);
assert.doesNotMatch(dup.text, /UNIQUE|constraint|profiles\.id|SQLITE/i); ok('conflicto 409: sin texto de la base de datos');
const fk = await call('POST', '/api/practice_sessions', { body: { id: 's9', profile_id: 'fantasma', course_id: 'c', subject_id: 's', topic_id: 't', kind: 'k' } });
assert.equal(fk.status >= 400 && fk.status < 500, true);
assert.doesNotMatch(fk.text, /FOREIGN|constraint|SQLITE|NOT NULL/i); ok('error de datos 4xx: sin texto de la base de datos');

const brokenDb = { prepare() { throw new Error(`no such table: ${SECRETO_INTERNO} (SELECT * FROM ${SECRETO_INTERNO})`); } };
const fail = await call('GET', '/api/profiles', { environment: { DB: brokenDb, API_KEY: 'secreto' } });
assert.equal(fail.status, 500);
assert.deepEqual(fail.data, { error: 'Error interno' });
assert.doesNotMatch(fail.text, new RegExp(SECRETO_INTERNO)); ok('error 500: solo "Error interno", sin detalles');

console.log(`${passed} comprobaciones de seguridad correctas`);
