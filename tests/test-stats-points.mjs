import assert from 'node:assert/strict';
import { makeD1 } from './d1-shim.js';
import worker from '../worker/worker.js';
import { createSession } from '../worker/auth-sessions.js';
import { summarizePointsJson } from '../worker/stats-summarize.js';
import { summarizePoints } from '../js/features/points/summarize-points.js';

// Los puntos calculados por el Worker deben ser idénticos a los de la app (mismas reglas en dos sitios).
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const sessions = []; const studied = [];
for (let i = 0; i < 400; i++) {
  const kind = ['practice', 'practice', 'reto', 'mix'][i % 4]; const total = 1 + Math.floor(rnd() * 12);
  const group = Math.floor(i / 8);
  sessions.push({ id: kind === 'practice' ? `s${i}` : `${kind}${group}:${['mates', 'ingles'][i % 2]}:t${i % 5}`, kind, correct: Math.floor(rnd() * (total + 1)), total, finished_at: new Date(Date.UTC(2026, 8, 1 + (i % 60), Math.floor(rnd() * 24), 30)).toISOString() });
}
for (let i = 0; i < 20; i++) studied.push({ completed_at: new Date(Date.UTC(2026, 8, 1 + i, 23, 59)).toISOString() });
const client = summarizePoints({ sessions, studied }); const server = summarizePointsJson({ sessions, studied });
assert.deepEqual({ ...server, byDay: new Map(Object.entries(server.byDay)) }, client); console.log('✓ el cálculo del Worker coincide con el de la app (400 sesiones, retos y mixes agrupados, 20 temas)');
sessions.push({ id: 'x', kind: 'practice', correct: 0, total: 5, finished_at: 'no-es-fecha' });
assert.deepEqual({ ...summarizePointsJson({ sessions, studied }), byDay: 0 }, { ...summarizePoints({ sessions, studied }), byDay: 0 }); console.log('✓ igual con una fecha rota');
assert.equal(summarizePointsJson({ sessions: [], studied: [] }).total, 0); console.log('✓ sin datos: 0');

// Ruta: permisos y datos
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname); const env = { DB: db, API_KEY: 'k' };
db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color) VALUES ('alex','Alex','#fff'),('lucia','Lucía','#fff')`);
const ins = db.sqlite.prepare('INSERT INTO practice_sessions (id,profile_id,course_id,subject_id,topic_id,total,correct,duration_s,finished_at,kind) VALUES (?,?,?,?,?,?,?,?,?,?)');
ins.run('a1', 'alex', '4-primaria', 'mates', 'tablas', 10, 8, 60, '2026-10-20T10:00:00Z', 'practice');
ins.run('l1', 'lucia', '4-primaria', 'mates', 'tablas', 10, 1, 60, '2026-10-20T10:00:00Z', 'practice');
db.sqlite.prepare("INSERT INTO study_progress (id,profile_id,course_id,subject_id,topic_id,completed_at) VALUES ('st1','alex','4-primaria','mates','tablas','2026-10-19T10:00:00Z')").run();
const alex = await createSession(db, 'alex'); const lucia = await createSession(db, 'lucia'); const parent = await createSession(db, 'parent');
const get = (tok, q = 'profile_id=eq.alex') => worker.fetch(new Request(`http://w/api/stats/points?${q}`, { headers: { 'X-Api-Key': 'k', ...(tok ? { 'X-Session': tok } : {}) } }), env);
let r = await get(alex); assert.equal(r.status, 200); let body = await r.json();
assert.equal(body.right, 8); assert.equal(body.wrong, 2); assert.equal(body.bonus, 5); assert.equal(body.studied, 1); assert.equal(body.total, 8 - 2 + 5 + 10); console.log('✓ un perfil recibe sus puntos');
assert.equal((await get(parent)).status, 200); console.log('✓ los padres pueden pedir los de cualquier perfil');
assert.equal((await get(lucia)).status, 403); console.log('✓ un perfil no puede pedir los de otro');
assert.equal((await get('')).status, 401); console.log('✓ sin sesión: 401');
assert.equal((await get(alex, '')).status, 400); console.log('✓ sin profile_id: 400');
r = await worker.fetch(new Request('http://w/api/stats/points?profile_id=eq.alex', { method: 'POST', headers: { 'X-Api-Key': 'k', 'X-Session': alex }, body: '{}' }), env); assert.equal(r.status, 404); console.log('✓ solo se puede leer');
