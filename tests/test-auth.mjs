// Acceso con código: crear código, entrar, bloqueo por fallos, caducidad a 7 días, aislamiento entre perfiles y cuenta de padres.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';

const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname);
const env = { DB: db, API_KEY: 'k', VAPID_PUBLIC_KEY: 'x', VAPID_PRIVATE_KEY: 'x', VAPID_SUBJECT: 'mailto:a@b.c' };
const sql = (text, ...args) => db.sqlite.prepare(text).run(...args);
const one = (text, ...args) => db.sqlite.prepare(text).get(...args);

async function call(method, path, { body, session } = {}) {
  const headers = { 'X-Api-Key': 'k' };
  if (session) headers['X-Session'] = session;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await worker.fetch(new Request(`https://w.example${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined }), env, { waitUntil() {} });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
}
let passed = 0;
const ok = (name) => { passed++; console.log('  ✓', name); };

// Dos perfiles creados antes de existir los códigos (como en producción).
sql("INSERT INTO profiles (id, name, avatar_color) VALUES ('alex', 'Alex', '#f00'), ('mama', 'Mamá', '#0f0')");
const list = await call('GET', '/auth/profiles');
assert.equal(list.status, 200); assert.deepEqual(list.data.map((p) => [p.id, p.has_code, p.ask_always]), [['alex', false, 0], ['mama', false, 0]]);
assert.ok(!JSON.stringify(list.data).includes('hash')); ok('los perfiles sin código lo avisan (has_code = false) y no enseñan nada secreto');
assert.equal((await call('GET', '/auth/profiles')).status, 200);
assert.equal((await worker.fetch(new Request('https://w.example/auth/profiles'), env)).status, 401); ok('las rutas /auth también exigen la clave de la app');

// Crear código
for (const bad of ['abc', '123', '123456789', '12 34', '', null]) assert.equal((await call('POST', '/auth/setup', { body: { owner: 'alex', code: bad } })).status, 400, String(bad));
ok('un código de menos de 4, más de 8 o con letras se rechaza');
assert.equal((await call('POST', '/auth/setup', { body: { owner: 'fantasma', code: '1234' } })).status, 404); ok('no se crea código para un perfil que no existe');
const setup = await call('POST', '/auth/setup', { body: { owner: 'alex', code: '4321' } });
assert.equal(setup.status, 201); assert.ok(setup.data.token.length >= 32);
const alexToken = setup.data.token;
assert.equal((await call('POST', '/auth/setup', { body: { owner: 'alex', code: '9999' } })).status, 409); ok('crear el código: queda entrado, y no se puede crear otra vez encima');
const cred = one("SELECT * FROM credentials WHERE owner = 'alex'");
assert.ok(!JSON.stringify(cred).includes('4321')); assert.equal(cred.hash.length, 64); ok('el código no se guarda: solo sal y huella');
assert.equal(one('SELECT COUNT(*) AS n FROM sessions WHERE token_hash = ?', alexToken).n, 0); ok('la sesión tampoco se guarda tal cual, solo su huella');

// Entrar
let r = await call('POST', '/auth/login', { body: { owner: 'alex', code: '1111' } });
assert.equal(r.status, 401); assert.equal(r.data.left, 4);
r = await call('POST', '/auth/login', { body: { owner: 'alex', code: '4321' } });
assert.equal(r.status, 200); assert.ok(r.data.token); ok('entrar: código malo 401 (con los intentos que quedan) y bueno 200');
assert.equal(one("SELECT fails FROM credentials WHERE owner = 'alex'").fails, 0); ok('un acierto pone a cero los fallos');
assert.equal((await call('POST', '/auth/login', { body: { owner: 'mama', code: '1234' } })).status, 404); ok('entrar en un perfil sin código -> 404 (la app le pide crearlo)');

// Bloqueo por fallos
const lockRound = async () => { let last; for (let i = 0; i < 5; i++) last = await call('POST', '/auth/login', { body: { owner: 'alex', code: '0000' } }); return last; };
r = await lockRound(); assert.equal(r.status, 423); assert.equal(r.data.retry_in, 60);
assert.equal((await call('POST', '/auth/login', { body: { owner: 'alex', code: '4321' } })).status, 423); ok('5 fallos seguidos: bloqueo de 1 minuto, aunque luego pongan el código bueno');
sql("UPDATE credentials SET locked_until = '2000-01-01T00:00:00Z' WHERE owner = 'alex'");
r = await lockRound(); assert.equal(r.status, 423); assert.equal(r.data.retry_in, 300); ok('segunda ronda: 5 minutos');
sql("UPDATE credentials SET locked_until = '2000-01-01T00:00:00Z' WHERE owner = 'alex'");
r = await lockRound(); assert.equal(r.data.retry_in, 900);
sql("UPDATE credentials SET locked_until = '2000-01-01T00:00:00Z' WHERE owner = 'alex'");
r = await lockRound(); assert.equal(r.data.retry_in, 900); ok('desde la tercera: 15 minutos como máximo');
sql("UPDATE credentials SET locked_until = '2000-01-01T00:00:00Z' WHERE owner = 'alex'");
assert.equal((await call('POST', '/auth/login', { body: { owner: 'alex', code: '4321' } })).status, 200);
assert.deepEqual({ ...one("SELECT fails, level, locked_until FROM credentials WHERE owner = 'alex'") }, { fails: 0, level: 0, locked_until: null }); ok('pasado el bloqueo, el código bueno entra y todo vuelve a cero');

// Caducidad de la sesión: 7 días sin usar
const shaOf = (t) => crypto.createHash('sha256').update(t).digest('hex');
const tokenHash = shaOf(alexToken);
const own = await call('GET', '/api/profiles/alex', { session: alexToken });
assert.equal(own.status, 200); assert.equal(own.data.name, 'Alex');
sql('UPDATE sessions SET last_used_at = ? WHERE token_hash = ?', new Date(Date.now() - 3600_000).toISOString(), tokenHash);
await call('GET', '/api/profiles/alex', { session: alexToken });
assert.ok(Date.now() - Date.parse(one('SELECT last_used_at FROM sessions WHERE token_hash = ?', tokenHash).last_used_at) < 60_000); ok('usar la sesión la renueva');
sql('UPDATE sessions SET last_used_at = ? WHERE token_hash = ?', new Date(Date.now() - 6.9 * 86400_000).toISOString(), tokenHash);
assert.equal((await call('GET', '/api/profiles/alex', { session: alexToken })).status, 200); ok('con 6 días sin usar sigue valiendo (y se renueva)');
sql('UPDATE sessions SET last_used_at = ? WHERE token_hash = ?', new Date(Date.now() - 7.1 * 86400_000).toISOString(), tokenHash);
assert.equal((await call('GET', '/api/profiles/alex', { session: alexToken })).status, 401);
assert.equal(one('SELECT COUNT(*) AS n FROM sessions WHERE token_hash = ?', tokenHash).n, 0); ok('a los 7 días sin usar caduca y se borra');
const alex2 = (await call('POST', '/auth/login', { body: { owner: 'alex', code: '4321' } })).data.token;

// Aislamiento entre perfiles
const mama = (await call('POST', '/auth/setup', { body: { owner: 'mama', code: '8888' } })).data.token;
const s = (id, profile) => ({ id, profile_id: profile, course_id: 'c', subject_id: 's', topic_id: 't', total: 8, correct: 7, finished_at: '2026-01-01T00:00:00Z' });
assert.equal((await call('POST', '/api/practice_sessions', { session: alex2, body: s('s1', 'alex') })).status, 201);
assert.equal((await call('POST', '/api/practice_sessions', { session: alex2, body: s('s2', 'mama') })).status, 403); ok('un perfil guarda lo suyo y no puede escribir en otro');
assert.equal((await call('POST', '/api/practice_sessions', { session: mama, body: s('s3', 'mama') })).status, 201);
r = await call('GET', '/api/practice_sessions', { session: alex2 });
assert.deepEqual(r.data.map((x) => x.id), ['s1']); ok('al leer, un perfil solo ve sus propias sesiones');
r = await call('GET', '/api/practice_sessions?profile_id=eq.mama', { session: alex2 });
assert.deepEqual(r.data, []); ok('pedir los datos de otro perfil devuelve vacío');
assert.equal((await call('GET', '/api/profiles/mama', { session: alex2 })).status, 403);
r = await call('GET', '/api/profiles', { session: alex2 }); assert.deepEqual(r.data.map((p) => p.id), ['alex']); ok('un perfil solo puede leer su propia ficha');
assert.equal((await call('POST', '/api/answers', { session: alex2, body: { id: 'a1', session_id: 's1', question_id: 'q', is_correct: 1 } })).status, 201);
assert.equal((await call('POST', '/api/answers', { session: alex2, body: { id: 'a2', session_id: 's3', question_id: 'q', is_correct: 1 } })).status, 403); ok('las respuestas solo se guardan en sesiones propias');
assert.equal((await call('DELETE', '/api/practice_sessions?id=eq.s3', { session: alex2 })).status, 403);
assert.equal((await call('GET', '/api/settings', { session: alex2 })).status, 403);
assert.equal((await call('DELETE', '/api/profiles/alex', { session: alex2 })).status, 403);
assert.equal((await call('POST', '/api/profiles', { session: alex2, body: { id: 'x', name: 'X', avatar_color: '#000' } })).status, 403);
assert.equal((await call('POST', '/api/topic_release', { session: alex2, body: { id: 'r', profile_id: 'alex', course_id: 'c', subject_id: 's', topic_id: 't' } })).status, 403); ok('un perfil no puede borrar perfiles, crearlos, leer ajustes ni liberarse temas');
assert.equal((await call('PATCH', '/api/profiles?id=eq.alex', { session: alex2, body: { course_id: '1-primaria' } })).status, 403);
r = await call('PATCH', '/api/profiles?id=eq.alex', { session: alex2, body: { name: 'Alejandro', ask_always: 1 } });
assert.equal(r.status, 200); assert.equal(one("SELECT ask_always FROM profiles WHERE id = 'alex'").ask_always, 1); ok('un perfil cambia su nombre y "pedir el código siempre", pero no su curso');
assert.equal((await call('PATCH', '/api/profiles?id=eq.mama', { session: alex2, body: { name: 'Hack' } })).data.count, 0); ok('cambiar el perfil de otro no toca nada');
const pushBody = (target) => ({ target, title: 't', body: 'b' });
assert.equal((await call('POST', '/push/send', { session: alex2, body: pushBody({ profile_id: 'mama' }) })).status, 403); ok('un perfil no puede mandar avisos a otro perfil');

// Cuenta de padres: se crea una vez con el PIN antiguo
const legacySalt = 'abcd'; const legacyHash = shaOf(`${legacySalt}:2468`);
sql("INSERT INTO settings (key, value) VALUES ('parent_pin', ?)", `${legacySalt}:${legacyHash}`);
r = await call('GET', '/auth/parent'); assert.deepEqual(r.data, { has_code: false, legacy: true });
assert.equal((await call('POST', '/auth/setup', { body: { owner: 'parent', code: '123456' } })).status, 401); ok('crear la cuenta de padres exige el PIN antiguo');
assert.equal((await call('POST', '/auth/setup', { body: { owner: 'parent', code: '123456', pin: '0000' } })).status, 401);
assert.equal((await call('POST', '/auth/setup', { body: { owner: 'parent', code: '12345', pin: '2468' } })).status, 400); ok('con el PIN malo no se crea; el código de padres necesita 6 cifras como mínimo');
r = await call('POST', '/auth/setup', { body: { owner: 'parent', code: '123456', pin: '2468' } });
assert.equal(r.status, 201); const parent = r.data.token;
assert.equal(one("SELECT COUNT(*) AS n FROM settings WHERE key = 'parent_pin'").n, 0);
assert.equal(one("SELECT COUNT(*) AS n FROM credentials WHERE owner = 'legacy-pin'").n, 0); ok('con el PIN bueno se crea y el PIN antiguo se borra');
assert.deepEqual((await call('GET', '/auth/parent')).data, { has_code: true, legacy: false });
assert.equal((await call('POST', '/auth/setup', { body: { owner: 'parent', code: '654321' } })).status, 409);
assert.equal((await call('POST', '/auth/login', { body: { owner: 'parent', code: '123456' } })).status, 200); ok('después, solo se entra con el código de padres');

// El PIN antiguo también está protegido contra intentos
sql("INSERT INTO settings (key, value) VALUES ('parent_pin', ?)", `${legacySalt}:${legacyHash}`);
sql("DELETE FROM credentials WHERE owner = 'parent'");
let last; for (let i = 0; i < 5; i++) last = await call('POST', '/auth/setup', { body: { owner: 'parent', code: '123456', pin: '1111' } });
assert.equal(last.status, 423); assert.equal((await call('POST', '/auth/setup', { body: { owner: 'parent', code: '123456', pin: '2468' } })).status, 423); ok('adivinar el PIN antiguo también se bloquea tras 5 fallos');
sql("UPDATE credentials SET locked_until = NULL, fails = 0 WHERE owner = 'legacy-pin'");
const parent2 = (await call('POST', '/auth/setup', { body: { owner: 'parent', code: '123456', pin: '2468' } })).data.token;

// Padres: ven todo; restablecen códigos
r = await call('GET', '/api/practice_sessions', { session: parent2 }); assert.equal(r.data.length, 2); ok('con la sesión de padres se ve todo');
assert.equal((await call('GET', '/api/settings', { session: parent2 })).status, 200);
assert.equal((await call('POST', '/api/profiles', { session: parent2, body: { id: 'nuevo', name: 'Nuevo', avatar_color: '#00f' } })).status, 201); ok('los padres crean perfiles');
assert.equal((await call('POST', '/auth/reset', { session: alex2, body: { owner: 'mama' } })).status, 403); ok('un perfil no puede restablecer códigos');
assert.equal((await call('POST', '/auth/reset', { session: parent2, body: { owner: 'mama' } })).status, 200);
assert.equal((await call('GET', '/api/profiles/mama', { session: mama })).status, 401);
assert.equal((await call('GET', '/auth/profiles')).data.find((p) => p.id === 'mama').has_code, false); ok('los padres restablecen el código de un perfil: se cierran sus sesiones y vuelve a pedir uno nuevo');

// Cambiar el código
assert.equal((await call('POST', '/auth/change', { session: alex2, body: { owner: 'alex', current: '0000', code: '5555' } })).status, 401);
r = await call('POST', '/auth/change', { session: alex2, body: { owner: 'alex', current: '4321', code: '5555' } });
assert.equal(r.status, 200); const alex3 = r.data.token;
assert.equal((await call('GET', '/api/profiles/alex', { session: alex2 })).status, 401);
assert.equal((await call('POST', '/auth/login', { body: { owner: 'alex', code: '4321' } })).status, 401);
assert.equal((await call('POST', '/auth/login', { body: { owner: 'alex', code: '5555' } })).status, 200); ok('cambiar el código exige el actual, cierra las demás sesiones y estrena el nuevo');
assert.equal((await call('POST', '/auth/change', { session: alex3, body: { owner: 'nuevo', current: '1', code: '5555' } })).status, 403); ok('un perfil no puede cambiar el código de otro');
r = await call('POST', '/auth/change', { session: parent2, body: { owner: 'alex', code: '7777' } });
assert.equal(r.status, 200); ok('los padres pueden poner un código nuevo a un perfil sin saber el actual');

// Cerrar sesión
const t = (await call('POST', '/auth/login', { body: { owner: 'alex', code: '7777' } })).data.token;
assert.equal((await call('POST', '/auth/logout', { session: t, body: {} })).status, 200);
assert.equal((await call('GET', '/api/profiles/alex', { session: t })).status, 401); ok('cerrar sesión la invalida');

// Borrar un perfil borra su código y sus sesiones
sql("DELETE FROM profiles WHERE id = 'alex'");
assert.equal(one("SELECT COUNT(*) AS n FROM credentials WHERE owner = 'alex'").n + one("SELECT COUNT(*) AS n FROM sessions WHERE owner = 'alex'").n, 0); ok('al borrar un perfil se borran su código y sus sesiones');

console.log(`\n${passed} comprobaciones de acceso OK`);
