import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import worker from './parent-worker.js';
import { makeD1 } from './d1-shim.js';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://yo.github.io/aprende/', pretendToBeVisual: true });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, location: window.location, localStorage: window.localStorage, sessionStorage: window.sessionStorage });
const { setSession } = await import('../js/core/api/session-store.js'); setSession('parent', 'test');
const db = makeD1(new URL('../worker/schema.sql', import.meta.url).pathname); const env = { DB: db, API_KEY: 'k' };
globalThis.fetch = async (url, init = {}) => worker.fetch(new Request(url, init), env);
const { setConnection } = await import('../js/core/api.js'); setConnection('https://w.example', 'k');
const ok = (n) => console.log('  ✓', n);

db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color) VALUES ('alex','Alex','#8EDBC0')`);
const ins = db.sqlite.prepare(`INSERT INTO practice_sessions (id,profile_id,course_id,subject_id,topic_id,total,correct,finished_at) VALUES (?,?,?,?,?,?,?,?)`);
db.sqlite.exec('BEGIN');
for (let i = 0; i < 2500; i++) ins.run(`s${i}`, 'alex', '4-primaria', 'mates', 'tablas', 8, 8, `2026-10-01T09:00:00.${String(i).padStart(4, '0')}`); // mismas fechas casi iguales
db.sqlite.exec('COMMIT');

const { listSessions } = await import('../js/data/practice.repo.js');
const all = await listSessions('alex');
assert.equal(all.length, 2500); assert.equal(new Set(all.map((s) => s.id)).size, 2500); ok('lee las 2500 sesiones, sin perder ni repetir ninguna');
assert.equal((await listSessions('alex', { subjectId: 'sociales' })).length, 0); ok('el filtro por asignatura sigue funcionando');
const { loadPoints } = await import('../js/features/points/load-points.js');
assert.equal((await loadPoints('alex')).right, 2500 * 8); ok('los puntos cuentan todas las sesiones');

const { reinforceCards } = await import('../js/features/parents/child-stats/reinforce-cards.js');
const card = reinforceCards([{ subjectId: 'ya-no-existe', topicId: 't', pct: 40 }], new Map());
assert.match(card.textContent, /ya-no-existe/); assert.match(card.textContent, /40%/); ok('una asignatura desconocida no rompe las tarjetas de refuerzo');
