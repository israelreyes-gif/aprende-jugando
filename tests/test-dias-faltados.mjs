import assert from 'node:assert/strict';
import { missedDays } from '../js/features/parents/child-stats/missed-days.js';
const m = (doneDays, freeDays = [], min = '2026-11-01') => missedDays({ doneDays, freeDays, today: '2026-11-28', min });
assert.deepEqual(m(['2026-11-20', '2026-11-21', '2026-11-24', '2026-11-27']), ['2026-11-22', '2026-11-23', '2026-11-25', '2026-11-26']);
assert.deepEqual(m(['2026-11-20', '2026-11-24', '2026-11-27'], ['2026-11-22', '2026-11-25']), ['2026-11-21', '2026-11-23', '2026-11-26']);
assert.deepEqual(m(['2026-11-27']), []); assert.deepEqual(m([]), []);
assert.deepEqual(m(['2026-10-01', '2026-11-26'], [], '2026-11-01'), ['2026-11-27'], 'ignora lo anterior al rango');
assert.deepEqual(m(['2026-11-26']), ['2026-11-27'], 'ayer sin hacer cuenta; hoy no');
console.log('  ✓ días sin reto: huecos, libres ya marcados, rango, ayer sí y hoy no');

// --- Botón (con Worker de pruebas) ---
import { JSDOM } from 'jsdom';
import parentWorker from './parent-worker.js';
import { makeD1 } from './d1-shim.js';
import { addDays, spainDay } from '../js/features/reto/streak/date-keys.js';
const { window } = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'https://yo.github.io/aprende/', pretendToBeVisual: true });
Object.assign(globalThis, { window, document: window.document, location: window.location, localStorage: window.localStorage, sessionStorage: window.sessionStorage });
const { setSession } = await import('../js/core/api/session-store.js'); setSession('parent', 'test');
const db = makeD1(new URL('../worker/schema.sql', import.meta.url).pathname); const env = { DB: db, API_KEY: 'k' };
globalThis.fetch = (url, init = {}) => parentWorker.fetch(new Request(url, init), env, { waitUntil() {} });
const { setConnection } = await import('../js/core/api.js'); setConnection('https://w.example', 'k');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = spainDay(); const d = (back) => addDays(today, -back);
db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color) VALUES ('alex','Alex','#000')`);
for (const back of [8, 7, 4, 1]) db.sqlite.prepare(`INSERT INTO reto_diario (id,profile_id,course_id,day,questions,answers,finished_at) VALUES (?,?,?,?,?,?,?)`).run(`r${back}`, 'alex', '4-primaria', d(back), '[]', '[]', `${d(back)}T10:00:00Z`);
const { freeDaysSection } = await import('../js/features/parents/child-stats/free-days-section.js');
const section = freeDaysSection({ profile: { id: 'alex', name: 'Alex' }, days: [d(5)] }); document.getElementById('app').replaceChildren(section);
const btn = [...section.querySelectorAll('button')].find((b) => /sin reto/.test(b.textContent)); assert.ok(btn);
btn.click(); await sleep(300);
assert.match(document.querySelector('.modal').textContent, /Marcar 3 días como libres/); // días 6, 3 y 2 (el 5 ya era libre)
[...document.querySelectorAll('.modal .btn')].find((b) => b.textContent === 'Marcarlos').click(); await sleep(400);
const saved = db.sqlite.prepare('SELECT day FROM free_days ORDER BY day').all().map((r) => r.day);
assert.deepEqual(saved, [d(6), d(3), d(2)].sort()); assert.equal(section.querySelectorAll('.free-days__row').length, 4);
console.log('  ✓ botón: lista los días sin reto, pide confirmar, los marca y se repinta');
