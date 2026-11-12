// Un perfil no puede pisar, robar ni mover las filas de otro perfil (ni el móvil de los padres) al escribir.
import assert from 'node:assert/strict';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';
import { createSession } from '../worker/auth-sessions.js';

const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname);
const env = { DB: db, API_KEY: 'k' };
const run = (s, ...a) => db.sqlite.prepare(s).run(...a); const get = (s, ...a) => db.sqlite.prepare(s).get(...a);
async function call(method, path, tok, body) {
  const headers = { 'X-Api-Key': 'k', 'X-Session': tok, ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) };
  const res = await worker.fetch(new Request(`https://w.example${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined }), env, { waitUntil() {} });
  return res.status;
}
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };

run("INSERT INTO profiles (id,name,avatar_color) VALUES ('alex','Alex','#f00'),('lucia','Lucía','#0f0')");
run("INSERT INTO topic_release (id,profile_id,course_id,subject_id,topic_id) VALUES ('ra','alex','c','mates','t')");
run("INSERT INTO practice_sessions (id,profile_id,course_id,subject_id,topic_id,total,correct,finished_at) VALUES ('l1','lucia','c','mates','t',10,10,'2026-10-01T10:00:00Z')");
run("INSERT INTO answers (id,session_id,question_id,is_correct,given) VALUES ('la1','l1','q',1,'7')");
run("INSERT INTO reto_diario (id,profile_id,course_id,day,questions) VALUES ('lr','lucia','c','2026-11-05','[]'),('ar','alex','c','2026-11-04','[]')");
run("INSERT INTO study_progress (id,profile_id,course_id,subject_id,topic_id,completed_at) VALUES ('ls','lucia','c','mates','t','2026-10-01T10:00:00Z')");
run("INSERT INTO push_devices (id,kind,profile_id,endpoint,p256dh,auth) VALUES ('child-lucia-x','child','lucia','https://e/1','p','a'),('parent-padres-y','parent',NULL,'https://e/2','p','a'),('child-alex-z','child','alex','https://e/3','p','a')");
const alex = await createSession(db, 'alex');

const own = { profile_id: 'alex', course_id: 'c', subject_id: 'mates', topic_id: 't' };
assert.equal(await call('POST', '/api/practice_sessions?conflict=replace', alex, { id: 'l1', ...own, total: 10, correct: 0, finished_at: 'x' }), 403);
assert.equal(get("SELECT profile_id p FROM practice_sessions WHERE id='l1'").p, 'lucia'); ok('no puede pisar con replace una sesión de otro perfil');
assert.equal(await call('POST', '/api/practice_sessions?conflict=replace', alex, { id: 'nueva', ...own, total: 10, correct: 1, finished_at: 'x' }), 403); ok('ni siquiera con un id nuevo: replace está prohibido en sesiones');
assert.equal(await call('POST', '/api/answers?conflict=replace', alex, [{ id: 'la1', session_id: 'l1', question_id: 'q', is_correct: 0, given: 'x' }]), 403);
assert.equal(get("SELECT given g FROM answers WHERE id='la1'").g, '7'); ok('no puede pisar respuestas de otro');
assert.equal(await call('POST', '/api/reto_diario?conflict=replace', alex, { id: 'lr', profile_id: 'alex', course_id: 'c', day: '2026-11-05', questions: '[]' }), 403);
assert.equal(get("SELECT profile_id p FROM reto_diario WHERE id='lr'").p, 'lucia'); ok('no puede robar el reto de otro');
assert.equal(await call('POST', '/api/study_progress?conflict=replace', alex, { id: 'ls', ...own, completed_at: 'x' }), 403);
assert.equal(get("SELECT profile_id p FROM study_progress WHERE id='ls'").p, 'lucia'); ok('no puede robar el «estudiado» de otro');
assert.equal(await call('PATCH', '/api/reto_diario/ar', alex, { profile_id: 'lucia' }), 403);
assert.equal(await call('PATCH', '/api/reto_diario/ar', alex, { day: '2026-01-01' }), 403);
assert.equal(get("SELECT profile_id p FROM reto_diario WHERE id='ar'").p, 'alex'); ok('no puede mover su reto a otro perfil ni cambiarle el día');
assert.equal(await call('PATCH', '/api/reto_diario/ar', alex, { answers: '[1]', finished_at: '2026-11-04T10:00:00Z' }), 200); ok('sí puede guardar las respuestas y cerrar su reto (uso normal)');

// Móviles de avisos: puede renovar el suyo, no pisar el de otro perfil ni el de los padres
const dev = (id, kind = 'child') => ({ id, kind, profile_id: kind === 'child' ? 'alex' : null, endpoint: 'https://e/9', p256dh: 'p', auth: 'a' });
assert.equal(await call('POST', '/api/push_devices?conflict=replace', alex, dev('child-alex-z')), 201); ok('puede renovar su propio móvil de avisos (replace)');
assert.equal(await call('POST', '/api/push_devices?conflict=replace', alex, dev('child-lucia-x')), 403);
assert.equal(get("SELECT profile_id p FROM push_devices WHERE id='child-lucia-x'").p, 'lucia'); ok('no puede pisar el móvil de otro perfil');
assert.equal(await call('POST', '/api/push_devices?conflict=replace', alex, dev('parent-padres-y')), 403);
assert.equal(get("SELECT kind k FROM push_devices WHERE id='parent-padres-y'").k, 'parent'); ok('no puede pisar el móvil de los padres');
assert.equal(await call('POST', '/api/push_devices?conflict=replace', alex, dev('child-alex-nuevo')), 201); ok('registrar un móvil nuevo con replace sigue funcionando');
assert.equal(await call('POST', '/api/practice_sessions?conflict=ignore', alex, { id: 'a-ok', ...own, total: 5, correct: 5, finished_at: new Date().toISOString() }), 201); ok('guardar un ejercicio normal (ignore) sigue funcionando');

// Datos inventados: no se aceptan
const fresh = () => new Date().toISOString();
const sess = (o) => ({ id: 'x' + Math.random(), ...own, total: 8, correct: 8, finished_at: fresh(), kind: 'practice', ...o });
const post = (t, body) => call('POST', '/api/' + t + '?conflict=ignore', alex, body);
assert.equal(await post('practice_sessions', sess({ total: 100000, correct: 100000 })), 400); ok('una sesión gigante (puntos inflados) se rechaza');
assert.equal(await post('practice_sessions', sess({ total: 41, correct: 41 })), 400);
assert.equal(await post('practice_sessions', sess({ total: 40, correct: 40, kind: 'reto' })), 201); ok('el máximo razonable (reto y mix: 36 preguntas) sigue valiendo');
assert.equal(await post('practice_sessions', sess({ correct: 9 })), 400); assert.equal(await post('practice_sessions', sess({ total: 0, correct: 0 })), 400); assert.equal(await post('practice_sessions', sess({ total: 1.5, correct: 1 })), 400); ok('aciertos mayores que preguntas o cantidades raras se rechazan');
assert.equal(await post('practice_sessions', sess({ kind: 'oro' })), 400); ok('un tipo de sesión inventado se rechaza');
assert.equal(await post('practice_sessions', sess({ finished_at: '2099-01-01T00:00:00Z' })), 400); assert.equal(await post('practice_sessions', sess({ finished_at: '2020-01-01T00:00:00Z' })), 400); assert.equal(await post('practice_sessions', sess({ finished_at: 'x' })), 400); ok('fechas en el futuro, de hace meses o no válidas se rechazan');
assert.equal(await post('practice_sessions', sess({ topic_id: 'inventado' })), 403); ok('practicar un tema que no está liberado (o no existe) se rechaza');
assert.equal(await post('study_progress', { id: 'e1', ...own, topic_id: 'inventado', completed_at: fresh() }), 403); ok('marcar como estudiado un tema inventado o sin liberar se rechaza');
assert.equal(await post('study_progress', { id: 'e2', ...own, completed_at: fresh() }), 201); ok('marcar como estudiado un tema liberado sigue funcionando');
assert.equal(await post('study_progress', { id: 'e3', ...own, completed_at: '2099-01-01T00:00:00Z' }), 400);

// Los padres siguen pudiendo todo
const parent = await createSession(db, 'parent');
assert.equal(await call('POST', '/api/settings?conflict=replace', parent, { key: 'k', value: 'v' }), 201); ok('los padres siguen pudiendo usar replace');
console.log(`\n${n} comprobaciones OK`);
