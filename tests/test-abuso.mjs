// Pruebas de abuso contra el Worker: lo que intentaría alguien que se salta la app y manda peticiones a mano.
// Cada caso comprueba que se rechaza (4xx, nunca 5xx ni 2xx) y que la base de datos no cambia.
import assert from 'node:assert/strict';
import { makeD1 } from './d1-shim.js';
import worker from '../worker/worker.js';
import { createSession } from '../worker/auth-sessions.js';
import { MAX_BODY_BYTES } from '../worker/http.js';
import { saveCredential } from '../worker/auth-credentials.js';
import { hashCode } from '../worker/auth-crypto.js';

const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname);
const env = { DB: db, API_KEY: 'k' };
const sql = (q, ...a) => db.sqlite.prepare(q).all(...a);
const T = Date.now();
const iso = (days = 0) => new Date(T + days * 86400000).toISOString();
const day = (days = 0) => iso(days).slice(0, 10);

db.sqlite.exec(`
  INSERT INTO profiles (id,name,avatar_color) VALUES ('alex','Alex','#fff'),('mia','Mia','#000');
  INSERT INTO topic_release (id,profile_id,course_id,subject_id,topic_id) VALUES ('rel1','alex','4-primaria','mates','tablas'),('rel2','mia','4-primaria','mates','tablas'),('rel3','mia','4-primaria','mates','secreto');
  INSERT INTO practice_sessions (id,profile_id,course_id,subject_id,topic_id,total,correct,duration_s,finished_at,kind) VALUES ('mia-s1','mia','4-primaria','mates','tablas',10,5,1,'${iso(-1)}','practice');
  INSERT INTO reto_diario (id,profile_id,course_id,day,questions,answers,finished_at) VALUES ('mia-r1','mia','4-primaria','${day(-1)}','[]','[]','${iso(-1)}');
  INSERT INTO study_progress (id,profile_id,course_id,subject_id,topic_id,completed_at) VALUES ('mia-st1','mia','4-primaria','mates','tablas','${iso(-1)}');
  INSERT INTO push_devices (id,kind,profile_id,endpoint,p256dh,auth) VALUES ('mia-d1','child','mia','https://push.example/m','p','a'),('par-d1','parent',NULL,'https://push.example/p','p','a');
`);
// Los padres ya tienen su código puesto (si no, la primera vez se puede crear sin sesión)
await saveCredential(db, 'parent', 'aa'.repeat(16), await hashCode('654321', 'aa'.repeat(16)));
const tokens = { alex: await createSession(db, 'alex'), mia: await createSession(db, 'mia'), parent: await createSession(db, 'parent') };

async function call(method, path, { as = 'alex', body, headers = {}, raw, session } = {}) {
  const init = { method, headers: { 'X-Api-Key': 'k', 'Content-Type': 'application/json', ...(session === null ? {} : { 'X-Session': session ?? tokens[as] }), ...headers } };
  if (method === 'GET' || method === 'HEAD') { /* las peticiones GET no llevan cuerpo */ } else if (raw !== undefined) init.body = raw; else if (body !== undefined) init.body = JSON.stringify(body);
  const res = await worker.fetch(new Request(`http://w${path}`, init), env, { waitUntil() {} });
  let data = null; try { data = await res.clone().json(); } catch { /* sin cuerpo */ }
  return { status: res.status, data, text: await res.text() };
}
const DENIED = [400, 401, 403, 404, 405, 409, 413, 423];
const denied = (r, what) => assert.ok(DENIED.includes(r.status), `${what}: debería rechazarse y dio ${r.status}`);
const dump = () => JSON.stringify(['profiles', 'practice_sessions', 'answers', 'study_progress', 'topic_release', 'reto_diario', 'push_devices', 'credentials', 'settings'].map((t) => sql(`SELECT * FROM ${t}`)));
const failures = []; let n = 0;
async function check(name, fn) {
  const before = dump();
  try { await fn(); if (dump() !== before && !/\(escribe\)/.test(name)) throw new Error('la base de datos ha cambiado'); n++; console.log('  ✓', name); } catch (e) { failures.push(`${name} → ${e.message}`); console.log('  ✗', name, '→', e.message); }
}
const session = (id, over = {}) => ({ id, profile_id: 'alex', course_id: '4-primaria', subject_id: 'mates', topic_id: 'tablas', total: 10, correct: 5, duration_s: 5, finished_at: iso(), kind: 'practice', ...over });

// ───────── 1. Inyección por filtros, orden, select y valores
await check('SQL en el nombre de una columna del filtro: 400 y las tablas siguen', async () => {
  for (const key of ['name"; DROP TABLE profiles; --', "name' OR '1'='1", 'name)--', '1=1', 'sqlite_master', 'or', 'and', '__proto__', 'constructor']) {
    const r = await call('GET', `/api/profiles?${encodeURIComponent(key)}=eq.x`, { as: 'parent' }); denied(r, key);
  }
  assert.equal(sql('SELECT COUNT(*) c FROM profiles')[0].c, 2);
});
await check('SQL en select y order: 400', async () => {
  for (const q of ['select=name;DROP TABLE profiles', 'select=*', 'select=id,(SELECT secret)', 'order=name;DROP TABLE profiles', 'order=name.sideways', 'order=(SELECT 1)', 'order=id.asc;--']) denied(await call('GET', `/api/profiles?${q}`, { as: 'parent' }), q);
});
await check('valores con comillas o comodines se tratan como texto', async () => {
  for (const v of ["eq.' OR '1'='1", 'eq.%', 'eq.alex" OR 1=1', 'in.alex,mia,\'x', 'like.%']) {
    const r = await call('GET', `/api/profiles?id=${encodeURIComponent(v)}`, { as: 'alex' });
    assert.equal(r.status, 200); assert.ok(r.data.every((p) => p.id === 'alex'), `${v}: un perfil no debe ver otros`);
  }
});
await check('operadores raros, límites y offsets absurdos no dan error 500', async () => {
  for (const q of ['id=between.1.2', 'id=regexp.a', 'id=eq', 'id=', 'id=in.', `id=in.${'a,'.repeat(300)}`, 'limit=-5', 'limit=abc', 'limit=1e9', 'offset=-1', 'offset=99999999999999999999', 'limit[]=1', 'limit=1&limit=2']) {
    const r = await call('GET', `/api/profiles?${q}`, { as: 'parent' }); assert.ok(r.status < 500, `${q} dio ${r.status}`);
  }
});

// ───────── 2. Un perfil no toca lo de otro
await check('un perfil no puede pedir lo de otro con filtros contradictorios o repetidos', async () => {
  for (const q of ['profile_id=eq.mia', 'profile_id=neq.alex', 'profile_id=in.mia,alex', 'profile_id=like.%', 'profile_id=eq.mia&profile_id=eq.alex', 'id=eq.mia-s1', 'profile_id=is.notnull']) {
    const r = await call('GET', `/api/practice_sessions?${q}`); assert.equal(r.status, 200, q); assert.ok(r.data.every((x) => x.profile_id === 'alex'), `${q}: ha visto filas de otro perfil`);
  }
  denied(await call('GET', '/api/practice_sessions/mia-s1'), 'leer por id una sesión ajena');
  denied(await call('GET', '/api/reto_diario/mia-r1'), 'leer por id un reto ajeno');
  denied(await call('GET', '/api/study_progress/mia-st1'), 'leer por id estudio ajeno');
});
await check('un perfil no puede modificar ni borrar filas de otro (por id ni por filtro) (escribe)', async () => {
  const others = () => JSON.stringify([sql("SELECT * FROM profiles WHERE id <> 'alex'"), sql("SELECT * FROM practice_sessions WHERE profile_id <> 'alex'"), sql("SELECT * FROM reto_diario WHERE profile_id <> 'alex'"), sql("SELECT * FROM study_progress WHERE profile_id <> 'alex'"), sql('SELECT * FROM push_devices')]);
  const before = others();
  for (const [m, p, b] of [
    ['PATCH', '/api/reto_diario/mia-r1', { finished_at: null }], ['PATCH', '/api/reto_diario?profile_id=eq.mia', { answers: '[]' }],
    ['DELETE', '/api/practice_sessions/mia-s1'], ['DELETE', '/api/study_progress/mia-st1'], ['DELETE', '/api/push_devices/mia-d1'], ['DELETE', '/api/push_devices/par-d1'],
    ['DELETE', '/api/push_devices?profile_id=eq.mia'], ['DELETE', '/api/push_devices'], ['PATCH', '/api/push_devices/mia-d1', { endpoint: 'https://push.example/robado' }], ['PATCH', '/api/push_devices/par-d1', { profile_id: 'alex' }],
    ['PATCH', '/api/profiles/mia', { name: 'Hackeada' }], ['PATCH', '/api/profiles', { name: 'Todos' }], ['DELETE', '/api/profiles/mia'], ['DELETE', '/api/profiles'],
  ]) { const r = await call(m, p, { body: b }); assert.ok(r.status < 500, `${m} ${p} dio ${r.status}`); }
  assert.equal(others(), before, 'han cambiado filas de otro perfil');
  sql("UPDATE profiles SET name = 'Alex' WHERE id = 'alex'");
});
await check('un perfil no puede crear filas a nombre de otro, ni sin dueño', async () => {
  for (const row of [session('x1', { profile_id: 'mia' }), session('x2', { profile_id: null }), (({ profile_id, ...rest }) => rest)(session('x3')), session('x4', { profile_id: ['alex'] }), session('x5', { profile_id: { $ne: 'x' } }), session('x6', { profile_id: 'alex ' }), session('x7', { profile_id: 'ALEX' })]) {
    denied(await call('POST', '/api/practice_sessions', { body: row }), JSON.stringify(row.profile_id));
  }
});
await check('un perfil no puede pisar una fila existente (mismo id, ni con conflict=replace)', async () => {
  denied(await call('POST', '/api/practice_sessions', { body: session('mia-s1') }), 'mismo id que una de otro');
  denied(await call('POST', '/api/practice_sessions?conflict=replace', { body: session('mia-s1') }), 'replace sobre sesiones');
  denied(await call('POST', '/api/push_devices?conflict=replace', { body: { id: 'par-d1', kind: 'child', profile_id: 'alex', endpoint: 'https://push.example/x', p256dh: 'p', auth: 'a' } }), 'robar el móvil de los padres');
  denied(await call('POST', '/api/push_devices?conflict=replace', { body: { id: 'mia-d1', kind: 'child', profile_id: 'alex', endpoint: 'https://push.example/x', p256dh: 'p', auth: 'a' } }), 'robar el móvil de otro perfil');
});
await check('un perfil no puede registrar un móvil como "padres" ni con un servicio de avisos falso', async () => {
  denied(await call('POST', '/api/push_devices', { body: { id: 'd9', kind: 'parent', profile_id: 'alex', endpoint: 'https://push.example/x', p256dh: 'p', auth: 'a' } }), 'kind parent');
  denied(await call('POST', '/api/push_devices', { body: { id: 'd9', kind: 'parent', profile_id: null, endpoint: 'https://push.example/x', p256dh: 'p', auth: 'a' } }), 'kind parent sin perfil');
  for (const endpoint of ['https://malo.example/x', 'http://fcm.googleapis.com/x', 'https://fcm.googleapis.com.malo.example/x', 'https://user:pw@fcm.googleapis.com/x', 'file:///etc/passwd', 'javascript:alert(1)', 'https://localhost/x', 'https://127.0.0.1/x', 'https://169.254.169.254/latest/meta-data']) {
    denied(await call('POST', '/api/push_devices', { body: { id: 'd8', kind: 'child', profile_id: 'alex', endpoint, p256dh: 'p', auth: 'a' } }), endpoint);
  }
});
await check('avisos push: solo a los padres o a sí mismo, con textos y url acotados', async () => {
  for (const body of [{ target: { profile_id: 'mia' }, title: 't', body: 'b' }, { target: { profile_id: 'parent' }, title: 't', body: 'b' }, { target: 'todos', title: 't', body: 'b' }, { target: null, title: 't', body: 'b' }, { target: 'parents', title: 'x'.repeat(101), body: 'b' }, { target: 'parents', title: 't', body: 'x'.repeat(301) }, { target: 'parents', title: '   ', body: 'b' }, { target: 'parents', title: 't', body: 'b', url: 'https://malo.example' }, { target: 'parents', title: ['t'], body: 'b' }]) {
    const r = await call('POST', '/push/send', { body }); assert.ok(r.status >= 400 && r.status < 500 || r.status === 500 && /VAPID/.test(r.text), `${JSON.stringify(body).slice(0, 80)} dio ${r.status}`);
  }
});
await check('estadísticas: un perfil solo pide las suyas', async () => {
  for (const q of ['profile_id=eq.mia', 'profile_id=eq.parent', 'profile_id=neq.alex', 'profile_id=', '', 'profile_id=eq.mia&profile_id=eq.alex']) denied(await call('GET', `/api/stats/points?${q}`), q || 'sin profile_id');
  for (const [m, p] of [['POST', '/api/stats/points?profile_id=eq.alex'], ['DELETE', '/api/stats/points?profile_id=eq.alex'], ['GET', '/api/stats/points/extra?profile_id=eq.alex']]) denied(await call(m, p), `${m} ${p}`);
});

// ───────── 3. Cosas de padres y tablas internas
await check('un perfil no llega a ajustes, códigos, sesiones, liberaciones ni títulos', async () => {
  for (const t of ['settings', 'credentials', 'sessions', 'topic_release', 'alert_cooldown', 'passkeys', 'sqlite_master', 'sqlite_schema', 'sqlite_sequence', 'd1_migrations', '_cf_KV', 'profiles;DROP TABLE profiles']) {
    for (const m of ['GET', 'POST', 'PATCH', 'DELETE']) { if (m === 'GET' && t === 'topic_release') continue; const r = await call(m, `/api/${encodeURIComponent(t)}`, { body: { id: 'x', name: 'x' } }); denied(r, `${m} ${t}`); }
  }
  const mine = await call('GET', '/api/topic_release'); assert.equal(mine.status, 200); assert.ok(mine.data.length > 0 && mine.data.every((r) => r.profile_id === 'alex'), 'solo ve sus liberaciones');
  denied(await call('POST', '/api/topic_release', { body: { id: 'rel9', profile_id: 'alex', course_id: '4-primaria', subject_id: 'mates', topic_id: 'secreto' } }), 'liberarse un tema');
  denied(await call('POST', '/api/topic_titles', { body: { id: 'x', course_id: 'a', subject_id: 'b', topic_id: 'c', title: 'x' } }), 'cambiar títulos');
  denied(await call('PATCH', '/api/profiles/alex', { body: { course_id: '5-primaria' } }), 'cambiarse de curso');
  denied(await call('PATCH', '/api/profiles/alex', { body: { id: 'parent' } }), 'cambiarse el id');
});
await check('ni los padres pueden leer las tablas internas (códigos, sesiones, ajustes)', async () => {
  for (const t of ['credentials', 'sessions', 'alert_cooldown', 'sqlite_master']) denied(await call('GET', `/api/${t}`, { as: 'parent' }), `padres leen ${t}`);
  const all = await call('GET', '/api', { as: 'parent' }); for (const t of ['credentials', 'sessions', 'alert_cooldown']) assert.ok(!all.data.tables.includes(t), `GET /api enseña ${t}`);
});

// ───────── 4. Inflar puntos con datos inventados
await check('sesiones imposibles: aciertos de más, ceros, negativos, decimales, textos', async () => {
  for (const over of [{ correct: 11 }, { total: 0, correct: 0 }, { total: 41, correct: 41 }, { total: -1, correct: 0 }, { correct: -1 }, { total: 10.5 }, { correct: 5.5 }, { total: '10' }, { correct: '5' }, { total: null }, { total: NaN }, { total: 1e9, correct: 1e9 }, { correct: Infinity }, { kind: 'otra' }, { kind: ['reto'] }, { id: '' }, { id: 'x'.repeat(121) }, { id: 5 }, { id: null }]) {
    denied(await call('POST', '/api/practice_sessions', { body: session('ok-' + Math.random(), over) }), JSON.stringify(over));
  }
});
await check('fechas imposibles: futuro, hace meses, basura', async () => {
  for (const finished_at of [iso(2), iso(-61), '2000-01-01T00:00:00Z', 'ayer', '', null, 5, '9999-12-31T00:00:00Z', 'NaN', {}]) denied(await call('POST', '/api/practice_sessions', { body: session('f-' + Math.random(), { finished_at }) }), String(finished_at));
});
await check('temas no liberados o inexistentes: no se puntúa ni se marca estudiado', async () => {
  for (const over of [{ topic_id: 'secreto' }, { topic_id: 'no-existe' }, { subject_id: 'otra' }, { course_id: '5-primaria' }, { topic_id: '' }, { topic_id: null }, { topic_id: ['tablas'] }]) {
    denied(await call('POST', '/api/practice_sessions', { body: session('t-' + Math.random(), over) }), JSON.stringify(over));
    denied(await call('POST', '/api/study_progress', { body: { id: 's-' + Math.random(), profile_id: 'alex', course_id: '4-primaria', subject_id: 'mates', topic_id: 'x', completed_at: iso(), ...over } }), 'estudio ' + JSON.stringify(over));
  }
});
await check('lotes: más de 50 filas, lotes mezclados con una fila mala y límite diario (escribe)', async () => {
  denied(await call('POST', '/api/practice_sessions', { body: Array.from({ length: 51 }, (_, i) => session('lote-' + i)) }), '51 filas');
  denied(await call('POST', '/api/practice_sessions', { body: [session('mezcla-1'), session('mezcla-2', { correct: 99 })] }), 'lote con una fila mala');
  assert.equal(sql("SELECT COUNT(*) c FROM practice_sessions WHERE id LIKE 'mezcla-%' OR id LIKE 'lote-%'")[0].c, 0, 'no debe guardar ni las buenas');
  let ok = 0, lastStatus = 0;
  for (let i = 0; i < 7; i++) { const r = await call('POST', '/api/practice_sessions', { body: Array.from({ length: 50 }, (_, j) => session(`d-${i}-${j}`)) }); lastStatus = r.status; if (r.status === 201) ok++; }
  assert.equal(ok, 6, `con 300 al día debían entrar 6 lotes y entraron ${ok}`); assert.equal(lastStatus, 400);
});
await check('respuestas: sesión ajena, demasiadas, textos enormes (escribe)', async () => {
  const ans = (id, sid, over = {}) => ({ id, session_id: sid, question_id: 'q1', is_correct: 1, given: 'x', ...over });
  denied(await call('POST', '/api/answers', { body: ans('a1', 'mia-s1') }), 'respuesta en sesión ajena');
  denied(await call('POST', '/api/answers', { body: ans('a2', 'no-existe') }), 'sesión que no existe');
  denied(await call('POST', '/api/answers', { body: [] }), 'lote vacío');
  denied(await call('POST', '/api/answers', { body: ans('a3', 'd-0-0', { given: 'x'.repeat(501) }) }), 'given enorme');
  denied(await call('POST', '/api/answers', { body: ans('a4', 'd-0-0', { is_correct: 2 }) }), 'is_correct 2');
  denied(await call('POST', '/api/answers', { body: Array.from({ length: 41 }, (_, i) => ans('m-' + i, 'd-0-0')) }), '41 respuestas');
  denied(await call('POST', '/api/answers', { body: ans('a5', 'd-0-0', { question_id: '' }) }), 'question_id vacío');
  denied(await call('DELETE', '/api/answers'), 'borrar respuestas'); denied(await call('PATCH', '/api/answers/a1', { body: { is_correct: 1 } }), 'cambiar respuestas');
});
await check('reto del día inventado: días falsos, fechas basura o respuestas enormes (la racha depende de esto)', async () => {
  const reto = (id, over = {}) => ({ id, profile_id: 'alex', course_id: '4-primaria', day: day(), questions: '[]', answers: '[]', finished_at: null, ...over });
  for (const over of [{ day: '1999-01-01' }, { day: day(-90) }, { day: day(3) }, { day: 'abc' }, { day: '' }, { day: null }, { finished_at: 'basura' }, { finished_at: iso(5) }, { finished_at: '2000-01-01T00:00:00Z' }, { questions: 'x'.repeat(100001) }, { questions: ['[]'] }, { answers: 'x'.repeat(60001) }, { answers: [] }, { id: '' }, { id: 'x'.repeat(121) }]) {
    denied(await call('POST', '/api/reto_diario', { body: reto('r-' + Math.random(), over) }), JSON.stringify(over).slice(0, 60));
  }
  denied(await call('POST', '/api/reto_diario', { body: Array.from({ length: 51 }, (_, i) => reto('rr-' + i, { day: day(-i % 50 - 1) })) }), '51 retos de golpe');
});
await check('reto del día: no se puede terminar con una fecha falsa ni con respuestas enormes (escribe)', async () => {
  const r0 = await call('POST', '/api/reto_diario', { body: { id: 'alex-r1', profile_id: 'alex', course_id: '4-primaria', day: day(), questions: '[]', answers: '[]', finished_at: null } }); assert.equal(r0.status, 201);
  for (const body of [{ finished_at: 'basura' }, { finished_at: iso(5) }, { finished_at: '2000-01-01T00:00:00Z' }, { answers: 'x'.repeat(60001) }, { day: day(-1) }, { profile_id: 'mia' }, { id: 'otro' }, { questions: '[]' }]) denied(await call('PATCH', '/api/reto_diario/alex-r1', { body }), JSON.stringify(body).slice(0, 60));
  denied(await call('POST', '/api/reto_diario', { body: { id: 'alex-r2', profile_id: 'alex', course_id: '4-primaria', day: day(), questions: '[]', answers: '[]' } }), 'un segundo reto el mismo día');
});

// ───────── 5. Formas raras del cuerpo y de la petición
await check('cuerpos raros: no JSON, nulos, vacíos, demasiado grandes, __proto__ (no dan 500)', async () => {
  for (const raw of ['', 'null', '[]', '[null]', '[[]]', '"texto"', '5', 'true', '{', '{"a":', '{"__proto__":{"admin":true}}', '{"constructor":{"prototype":{"x":1}}}', '\u0000\u0000', '{"id":"' + 'x'.repeat(2000) + '"}']) {
    for (const path of ['/api/practice_sessions', '/api/study_progress', '/api/reto_diario', '/api/answers', '/api/push_devices', '/api/sync_events', '/push/send']) for (const as of ['alex', 'parent']) { const r = await call('POST', path, { raw, as }); assert.ok(r.status >= 400 && r.status < 500 || r.status === 500 && /VAPID/.test(r.text), `${as} ${path} con ${raw.slice(0, 20)} dio ${r.status}`); }
  }
  denied(await call('POST', '/api/practice_sessions', { raw: JSON.stringify({ pad: 'x'.repeat(MAX_BODY_BYTES + 10) }) }), 'cuerpo de más de 1 MB');
  denied(await call('POST', '/api/practice_sessions', { raw: '{}', headers: { 'Content-Length': String(MAX_BODY_BYTES + 1) } }), 'Content-Length enorme');
  assert.equal(Object.prototype.admin, undefined); assert.equal({}.admin, undefined);
});
await check('nombre de perfil: vacío, de 21 caracteres, solo espacios, otro tipo (no dan 500)', async () => {
  for (const name of ['', '   ', 'x'.repeat(21), 'x'.repeat(100000), 5, null, ['a'], { a: 1 }, 'parent', 'PARENT']) { const r = await call('PATCH', '/api/profiles/alex', { body: { name } }); assert.ok(r.status >= 400 && r.status < 500, `${JSON.stringify(name).slice(0, 30)} dio ${r.status}`); }
});
await check('eventos de sincronización: textos enormes, tipos raros y perfil ajeno (escribe)', async () => {
  const ev = (over) => ({ id: 'e-' + Math.random(), profile_id: 'alex', outcome: 'failed', what: 'practice_sessions', detail: 'x', ...over });
  for (const over of [{ what: 'x'.repeat(501) }, { detail: 'x'.repeat(501) }, { outcome: 'otra' }, { profile_id: 'mia' }, { what: null }, { id: null }]) denied(await call('POST', '/api/sync_events', { body: ev(over) }), JSON.stringify(over).slice(0, 50));
  for (const m of ['GET', 'PATCH', 'DELETE']) denied(await call(m, '/api/sync_events', { body: {} }), `${m} sync_events`);
});

// ───────── 6. Claves, sesiones y cabeceras
await check('sesiones falsas: vacía, muy larga, con SQL, de otro perfil modificada, repetida en cabecera', async () => {
  for (const s of ['', ' ', 'x', 'x'.repeat(100000), "' OR '1'='1", tokens.alex + 'x', tokens.alex.slice(1), tokens.alex.toUpperCase(), 'null', 'undefined', '../../etc/passwd', tokens.alex + ', ' + tokens.parent]) {
    const r = await call('GET', '/api/profiles', { session: s }); assert.ok(r.status === 401 || r.status === 400, `sesión "${s.slice(0, 20)}" dio ${r.status}`);
  }
  denied(await call('GET', '/api/profiles', { session: null }), 'sin cabecera de sesión');
  assert.equal((await call('GET', '/api/profiles', { headers: { 'X-Session-Owner': 'parent', 'X-Owner': 'parent', 'X-Forwarded-User': 'parent' } })).data.length, 1, 'cabeceras inventadas no dan permisos');
});
await check('clave de la app mala o en otro sitio: 401', async () => {
  for (const key of ['', 'K', 'kk', 'k k', 'x'.repeat(10000)]) { const r = await call('GET', '/api/profiles', { headers: { 'X-Api-Key': key } }); assert.equal(r.status, 401, JSON.stringify(key).slice(0, 20)); }
  assert.equal((await call('GET', '/api/profiles?api_key=k', { headers: { 'X-Api-Key': 'mala' } })).status, 401, 'la clave por URL no vale');
});
await check('login y códigos con tipos raros: no dan 500 ni entran', async () => {
  for (const body of [{ owner: { $ne: 'x' }, code: '1234' }, { owner: ['alex'], code: '1234' }, { owner: 'alex', code: { $ne: 1 } }, { owner: 'alex', code: ['1234'] }, { owner: 'alex', code: 1234 }, { owner: 'alex', code: null }, { owner: 'alex' }, { owner: 'x'.repeat(100000), code: '1234' }, { owner: "alex' OR '1'='1", code: '1234' }, { owner: 'ALEX', code: '1234' }, { owner: 'parent ', code: '123456' }, { code: '1234' }, {}, { owner: null, code: null }]) {
    const r = await call('POST', '/auth/login', { body, session: null }); assert.ok(r.status >= 400 && r.status < 500, `${JSON.stringify(body).slice(0, 50)} dio ${r.status}`); assert.ok(!r.data?.token, 'no debe dar sesión');
  }
});
await check('crear códigos sin permiso: sin sesión, con la sesión de un perfil, para otro o para los padres', async () => {
  for (const [as, owner] of [['none', 'alex'], ['alex', 'alex'], ['alex', 'mia'], ['alex', 'parent'], ['none', 'mia']]) {
    const r = await call('POST', '/auth/setup', { body: { owner, code: '123456' }, ...(as === 'none' ? { session: null } : { as }) }); assert.ok([401, 403, 409, 400].includes(r.status), `${as}→${owner} dio ${r.status}`);
  }
  denied(await call('POST', '/auth/change', { body: { owner: 'mia', code: '123456', current: '1234' } }), 'cambiar el código de otro');
  denied(await call('POST', '/auth/change', { body: { owner: 'parent', code: '123456', current: '123456' } }), 'cambiar el código de los padres');
});
await check('métodos, rutas y mayúsculas raras: 404/405, nunca 500', async () => {
  for (const [m, p] of [['PUT', '/api/profiles'], ['PATCH', '/api'], ['DELETE', '/api'], ['GET', '/API/profiles'], ['GET', '/api/profiles/'], ['GET', '/api/profiles/alex/extra'], ['GET', '/api/%2e%2e/profiles'], ['GET', '/api/profiles%00'], ['GET', '/api/profiles%2F..%2Fcredentials'], ['GET', '/auth/'], ['GET', '/auth/login'], ['POST', '/auth/inexistente'], ['GET', '/push'], ['GET', '/']]) {
    const r = await call(m, p, { as: 'parent' }); assert.ok(r.status >= 400 && r.status < 500 || (r.status === 200 && p === '/api/profiles/' ), `${m} ${p} dio ${r.status}`);
  }
});
await check('CORS: un sitio no permitido no recibe permiso (con ALLOWED_ORIGIN fijado)', async () => {
  const strict = { ...env, ALLOWED_ORIGIN: 'https://israelreyes-gif.github.io' };
  const res = (origin) => worker.fetch(new Request('http://w/api/profiles', { method: 'OPTIONS', headers: origin ? { Origin: origin } : {} }), strict);
  assert.equal((await res('https://malo.example')).headers.get('Access-Control-Allow-Origin'), null);
  assert.equal((await res('https://israelreyes-gif.github.io.malo.example')).headers.get('Access-Control-Allow-Origin'), null);
  assert.equal((await res('https://israelreyes-gif.github.io')).headers.get('Access-Control-Allow-Origin'), 'https://israelreyes-gif.github.io');
  assert.equal((await res(null)).headers.get('Access-Control-Allow-Origin'), null);
});
await check('los errores no enseñan SQL, rutas del servidor ni trazas', async () => {
  for (const [m, p, b] of [['GET', '/api/profiles?foo=eq.1'], ['POST', '/api/profiles', { name: 'x'.repeat(30), id: 'zz', avatar_color: '#000' }], ['POST', '/api/practice_sessions', session('mia-s1')], ['GET', '/api/nada']]) {
    const r = await call(m, p, { as: 'parent', body: b }); assert.ok(!/SELECT|INSERT|sqlite|SQLITE|constraint|at \w+ \(|node:|\/home\//i.test(r.text), `${m} ${p}: ${r.text.slice(0, 120)}`);
  }
});

// Cabeceras de las respuestas JSON del Worker: sin caché y sin adivinar el tipo de contenido.
await check('respuestas del Worker: nosniff y no-store', async () => {
  const r = await worker.fetch(new Request('https://w.example/api/profiles', { headers: { 'X-Api-Key': 'wrong' } }), env);
  assert.equal(r.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(r.headers.get('Cache-Control'), 'no-store');
});

console.log(`\n${n} comprobaciones OK`);
if (failures.length) { console.log(`\n${failures.length} con fallos:`); for (const f of failures) console.log(' ✗', f); process.exit(1); }
process.exit(0);
