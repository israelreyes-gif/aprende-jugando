// Días libres: permisos del Worker, repositorio, rango de fechas, sección de la zona de padres y copias de seguridad antiguas.
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import parentWorker from './parent-worker.js';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';
import { createSession } from '../worker/auth-sessions.js';

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'https://yo.github.io/aprende/', pretendToBeVisual: true });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, location: window.location, localStorage: window.localStorage, sessionStorage: window.sessionStorage });
const { setSession } = await import('../js/core/api/session-store.js'); setSession('parent', 'test');
const db = makeD1(new URL('../worker/schema.sql', import.meta.url).pathname); const env = { DB: db, API_KEY: 'k' };
const sqlAll = (q, ...a) => db.sqlite.prepare(q).all(...a);
let who = 'parent'; let childToken = null;
globalThis.fetch = async (url, init = {}) => {
  if (who === 'child') { const headers = new Headers(init.headers); headers.set('X-Session', childToken); return worker.fetch(new Request(url, { ...init, headers }), env, { waitUntil() {} }); }
  return parentWorker.fetch(new Request(url, init), env, { waitUntil() {} });
};
const { setConnection } = await import('../js/core/api.js'); setConnection('https://w.example', 'k');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };

db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color) VALUES ('alex','Alex','#8EDBC0'),('mia','Mia','#000')`);
childToken = await createSession(db, 'alex');

// --- Repositorio (padres) ---
const { listFreeDays, addFreeDay, removeFreeDay } = await import('../js/data/free-days.repo.js');
await addFreeDay('alex', '2026-11-26'); await addFreeDay('alex', '2026-11-26'); await addFreeDay('alex', '2026-11-20'); await addFreeDay('mia', '2026-11-26');
assert.deepEqual(await listFreeDays('alex'), ['2026-11-26', '2026-11-20']); ok('padres: añadir (sin duplicar el mismo día) y listar, de más reciente a más antiguo y solo del perfil');
await removeFreeDay('alex', '2026-11-20');
assert.deepEqual(await listFreeDays('alex'), ['2026-11-26']); assert.deepEqual(await listFreeDays('mia'), ['2026-11-26']); ok('padres: quitar un día no toca los de otro perfil');

// --- Permisos: un perfil solo lee los suyos y no puede crear ni borrar ---
const { clearMemoryCache } = await import('../js/core/api/memory-cache.js');
who = 'child'; clearMemoryCache(); // la caché en memoria no distingue sesiones: se vacía al cambiar de quién pregunta
assert.deepEqual(await listFreeDays('alex'), ['2026-11-26']);
assert.deepEqual(await listFreeDays('mia'), [], 'un perfil no ve los días libres de otro');
await assert.rejects(addFreeDay('alex', '2026-11-30')); await assert.rejects(removeFreeDay('alex', '2026-11-26'));
who = 'parent'; clearMemoryCache();
assert.deepEqual(sqlAll('SELECT day FROM free_days WHERE profile_id = ? ORDER BY day', 'alex').map((r) => r.day), ['2026-11-26']); ok('perfil: lee solo los suyos; no puede añadir ni quitar (eso es de la zona de padres)');

// --- Rango ---
const { freeDayRange, isValidFreeDay, freeDayText } = await import('../js/features/parents/child-stats/free-day-range.js');
const range = freeDayRange(new Date('2026-11-28T10:00:00Z'));
assert.deepEqual(range, { today: '2026-11-28', min: '2026-10-29', max: '2027-01-27' });
assert.ok(isValidFreeDay('2026-11-26', range) && isValidFreeDay('2026-10-29', range) && isValidFreeDay('2027-01-27', range));
for (const bad of ['2026-10-28', '2027-01-28', '2026-02-30', '26-11-26', '', 'x', '2026-13-01']) assert.equal(isValidFreeDay(bad, range), false, bad);
assert.match(freeDayText('2026-11-27'), /viernes/); ok('rango: de 30 días atrás a 60 hacia delante; rechaza fechas inventadas o fuera de rango');

// --- Sección en la zona de padres ---
const { freeDaysSection } = await import('../js/features/parents/child-stats/free-days-section.js');
const today = freeDayRange().today;
const profile = { id: 'alex', name: 'Alex' };
const section = freeDaysSection({ profile, days: ['2001-01-01'] });
document.getElementById('app').append(section);
const rowsOf = () => [...section.querySelectorAll('.free-days__row')];
assert.match(section.textContent, /Días libres/); assert.match(section.textContent, /no suma a la racha de Alex ni la rompe/);
assert.equal(rowsOf().length, 0, 'un día libre fuera del rango de 30 días no se enseña (solo se muestran los recientes)'); assert.match(section.textContent, /No hay días libres marcados/);
const input = section.querySelector('input[type="date"]'); const add = [...section.querySelectorAll('button')].find((b) => /Añadir/.test(b.textContent));
assert.equal(input.value, today); ok('sección: título, explicación con el nombre, fecha de hoy preseleccionada y lista vacía si no hay días recientes');
input.value = today; add.click(); await sleep(150);
assert.equal(rowsOf().length, 1); assert.deepEqual(sqlAll('SELECT day FROM free_days WHERE profile_id = ? AND day = ?', 'alex', today).map((r) => r.day), [today]); ok('sección: "Añadir día libre" lo guarda en D1 y lo enseña');
add.click(); await sleep(100); assert.equal(rowsOf().length, 1); assert.equal(sqlAll('SELECT * FROM free_days WHERE day = ? AND profile_id = ?', today, 'alex').length, 1); ok('sección: añadir el mismo día otra vez no lo duplica');
input.value = '1999-01-01'; add.click(); await sleep(80);
assert.ok(document.querySelector('.modal')); assert.match(document.querySelector('.modal').textContent, /Fecha no válida/); assert.equal(sqlAll('SELECT * FROM free_days WHERE day = ?', '1999-01-01').length, 0);
document.querySelector('.modal .btn').click(); await sleep(80); ok('sección: una fecha fuera de rango avisa y no guarda nada');
[...section.querySelectorAll('.free-days__row button')][0].click(); await sleep(150);
assert.equal(rowsOf().length, 0); assert.equal(sqlAll('SELECT * FROM free_days WHERE day = ? AND profile_id = ?', today, 'alex').length, 0); ok('sección: "Quitar" lo borra de D1 y de la lista');

// --- Copias de seguridad: las antiguas (sin días libres) siguen valiendo ---
const { checkBackup } = await import('../js/features/backup/check-backup.js');
const old = { app: 'aprende-y-juega', format: 1, created_at: '2026-11-01T10:00:00Z', tables: { profiles: [], practice_sessions: [], answers: [], study_progress: [], topic_release: [], reto_diario: [] } };
assert.deepEqual(checkBackup(old).tables.free_days, []);
assert.throws(() => checkBackup({ ...old, tables: { ...old.tables, reto_diario: undefined } }), /incompleta/);
assert.throws(() => checkBackup({ ...old, tables: { ...old.tables, free_days: [{ nope: 1 }] } }), /incompleta/); ok('copias: una copia antigua sin días libres se lee; una estropeada sigue rechazándose');
const { buildBackup } = await import('../js/features/backup/build-backup.js');
await addFreeDay('alex', '2026-11-26');
const made = await buildBackup(); assert.ok(made.tables.free_days.some((r) => r.day === '2026-11-26')); ok('copias: la nueva copia incluye los días libres');

// --- Worker nuevo con la tabla aún sin crear en D1: todo sigue funcionando sin días libres ---
db.sqlite.exec('DROP TABLE free_days');
const { protectedDaysOf } = await import('../worker/shield-data.js');
assert.deepEqual(await protectedDaysOf(db, 'alex'), []);
const { handleStatsPoints } = await import('../worker/stats-points.js');
const res = await handleStatsPoints(new Request('http://w/api/stats/points?profile_id=eq.alex'), env, ['api', 'stats', 'points'], {}, { owner: 'parent' });
assert.equal(res.status, 200);
const profilesRes = await parentWorker.fetch(new Request('https://w.example/auth/profiles', { headers: { 'X-Api-Key': 'k' } }), env, { waitUntil() {} });
assert.equal(profilesRes.status, 200); ok('Worker nuevo sin la tabla free_days: recordatorios, puntos y lista de perfiles siguen funcionando');
console.log(`\n${n} comprobaciones OK`);
