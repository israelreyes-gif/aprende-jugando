// Protectores de racha: cálculo (app y Worker iguales), reglas del Worker, pantalla del perfil y zona de padres.
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import parentWorker from './parent-worker.js';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';
import { createSession } from '../worker/auth-sessions.js';
import { shieldBalance } from '../js/features/reto/shield/shield-balance.js';
import { shieldBalance as workerBalance } from '../worker/shield-balance.js';
import { missedDays } from '../js/features/reto/shield/missed-days.js';
import { computeStreak } from '../js/features/reto/streak/compute-streak.js';
import { addDays, spainDay } from '../js/features/reto/streak/date-keys.js';

let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };
const run = (start, count) => Array.from({ length: count }, (_, i) => addDays(start, i)); // días seguidos desde start

// --- Cálculo ---
assert.deepEqual(shieldBalance(run('2026-09-01', 9), [], []), { earned: 0, used: 0, available: 0 });
assert.deepEqual(shieldBalance(run('2026-09-01', 10), [], []), { earned: 1, used: 0, available: 1 });
assert.deepEqual(shieldBalance(run('2026-09-01', 25), [], []), { earned: 2, used: 0, available: 2 });
assert.deepEqual(shieldBalance(run('2026-09-01', 25), [], ['2026-12-31']), { earned: 2, used: 1, available: 1 });
assert.equal(shieldBalance(run('2026-09-01', 10), [], ['2026-12-01', '2026-12-02']).available, 0, 'nunca baja de 0'); ok('1 protector por cada 10 días de racha, menos los usados (nunca negativo)');
// una racha rota no cuenta como seguida: 6 + fallo doble + 6 = ninguna llega a 10
assert.equal(shieldBalance([...run('2026-09-01', 6), ...run('2026-09-10', 6)], [], []).earned, 0);
// un día protegido mantiene la racha y por tanto puede dar el décimo día: 6 + (2 fallos, uno protegido) + 6
const withShield = [...run('2026-09-01', 6), ...run('2026-09-09', 6)]; // hechos 1-6 y 9-14; falla el 7 y el 8
assert.equal(shieldBalance(withShield, [], ['2026-09-07']).earned, 1); ok('un día protegido sigue la racha y puede completar los 10 días');
// el protector gastado en un día rompe-racha la salva de verdad
const done = [...run('2026-11-01', 12), '2026-11-15', '2026-11-16']; // fallan el 13 y el 14
assert.equal(computeStreak(done, '2026-11-17'), 2);
assert.equal(computeStreak(done, '2026-11-17', ['2026-11-13']), 14); ok('proteger uno de dos días fallados deja la racha como si solo hubiera fallado uno (cortesía)');

// --- Paridad con el Worker (azar) ---
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let round = 0; round < 80; round++) {
  const d = [], f = [], s = [];
  for (let i = 0; i < 100; i++) { const day = addDays('2026-08-01', i); const r = rnd(); if (r < 0.7) d.push(day); else if (r < 0.8) f.push(day); else if (r < 0.88) s.push(day); }
  assert.deepEqual(shieldBalance(d, f, s), workerBalance(d, f, s));
}
ok('la copia del Worker calcula lo mismo (80 casos al azar)');

// --- Días que se pueden proteger ---
assert.deepEqual(missedDays([], [], [], '2026-11-28'), []);
assert.deepEqual(missedDays(['2026-11-20', '2026-11-21', '2026-11-24'], ['2026-11-25'], ['2026-11-26'], '2026-11-28'), ['2026-11-22', '2026-11-23', '2026-11-27']);
assert.deepEqual(missedDays(['2026-11-27'], [], [], '2026-11-28'), [], 'no se protegen días anteriores al primer reto');
assert.deepEqual(missedDays(['2026-11-01'], [], [], '2026-11-28'), run('2026-11-21', 7), 'solo los últimos 7 días, sin contar hoy'); ok('días protegibles: últimos 7 sin hoy, tras el primer reto, sin hechos/libres/ya protegidos');

// --- Entorno con Worker ---
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'https://yo.github.io/aprende/', pretendToBeVisual: true });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, location: window.location, localStorage: window.localStorage, sessionStorage: window.sessionStorage });
const { setSession } = await import('../js/core/api/session-store.js'); setSession('parent', 'test');
const db = makeD1(new URL('../worker/schema.sql', import.meta.url).pathname); const env = { DB: db, API_KEY: 'k' };
const sqlAll = (q, ...a) => db.sqlite.prepare(q).all(...a);
let who = 'parent'; let childToken = null; let otherToken = null;
globalThis.fetch = async (url, init = {}) => {
  if (who === 'parent') return parentWorker.fetch(new Request(url, init), env, { waitUntil() {} });
  const headers = new Headers(init.headers); headers.set('X-Session', who === 'child' ? childToken : otherToken);
  return worker.fetch(new Request(url, { ...init, headers }), env, { waitUntil() {} });
};
const { setConnection } = await import('../js/core/api.js'); setConnection('https://w.example', 'k');
const { clearMemoryCache } = await import('../js/core/api/memory-cache.js');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const switchTo = (w) => { who = w; clearMemoryCache(); };

const today = spainDay();
db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color) VALUES ('alex','Alex','#8EDBC0'),('mia','Mia','#000')`);
childToken = await createSession(db, 'alex'); otherToken = await createSession(db, 'mia');
const fin = (profile, day) => db.sqlite.prepare(`INSERT INTO reto_diario (id,profile_id,course_id,day,questions,answers,finished_at) VALUES (?,?,?,?,?,?,?)`).run(`r-${profile}-${day}`, profile, '4-primaria', day, '[]', '[]', `${day}T10:00:00Z`);
// Alex: 10 retos seguidos hasta anteayer (hoy-11 … hoy-2); ayer (hoy-1) lo falló → 1 protector ganado
for (let back = 11; back >= 2; back--) fin('alex', addDays(today, -back));
const yesterday = addDays(today, -1);

const { addShield, listShieldDays, removeShield } = await import('../js/data/shields.repo.js');
const { loadRetoStatus } = await import('../js/features/reto/reto-status.js');
switchTo('child');
let status = await loadRetoStatus('alex');
assert.equal(status.shields.available, 1); assert.deepEqual(status.missed, [yesterday]); assert.equal(status.streak, 10); ok('estado del reto: 10 días de racha = 1 protector disponible y ayer es protegible');

// --- Reglas del Worker (perfil) ---
const rejected = async (profileId, day, why, as = 'child') => { switchTo(as); await assert.rejects(addShield(profileId, day), undefined, why); };
await rejected('alex', today, 'hoy no');
await rejected('alex', addDays(today, 1), 'mañana no');
await rejected('alex', addDays(today, -9), 'más de 7 días atrás no');
await rejected('alex', addDays(today, -4), 'un día con reto hecho no');
await rejected('alex', '2026-13-45', 'fecha inventada');
for (const day of ['2026-13-45', '2026-02-30', 'ayer', '']) {
  const res = await worker.fetch(new Request('https://w.example/api/streak_shields', { method: 'POST', headers: { 'X-Api-Key': 'k', 'Content-Type': 'application/json', 'X-Session': childToken }, body: JSON.stringify({ id: 'x', profile_id: 'alex', day }) }), env, { waitUntil() {} });
  assert.equal(res.status, 400, `${day} debe dar 400 y no un error interno`);
}
await rejected('alex', yesterday, 'otro perfil no puede gastar los protectores de Alex', 'other');
switchTo('child');
await assert.rejects(addShield('mia', yesterday), undefined, 'ni crearlo a nombre de otro');
assert.equal(sqlAll('SELECT * FROM streak_shields').length, 0); ok('Worker: rechaza hoy, futuro, más de 7 días, día con reto hecho, fecha falsa y a nombre de otro');
await addShield('alex', yesterday);
assert.deepEqual(sqlAll('SELECT day FROM streak_shields').map((r) => r.day), [yesterday]); ok('Worker: acepta ayer cuando hay protector');
await assert.rejects(addShield('alex', yesterday), undefined, 'el mismo día dos veces no');
db.sqlite.exec(`DELETE FROM streak_shields`);
fin('alex', addDays(today, -1)); // ahora ayer sí lo hizo: 12 seguidos, 1 protector ganado pero sin días que salvar
await assert.rejects(addShield('alex', addDays(today, -12)), undefined, 'anterior al primer reto no');
db.sqlite.exec(`DELETE FROM reto_diario WHERE day = '${addDays(today, -1)}'`);
// sin protector: Mia tiene 3 retos
for (let back = 5; back >= 3; back--) fin('mia', addDays(today, -back));
switchTo('other'); await assert.rejects(addShield('mia', addDays(today, -1)), undefined, 'sin protectores no');
db.sqlite.exec(`INSERT INTO free_days (id,profile_id,day) VALUES ('f1','alex','${yesterday}')`);
switchTo('child'); await assert.rejects(addShield('alex', yesterday), undefined, 'un día que ya es libre no'); db.sqlite.exec(`DELETE FROM free_days`);
assert.equal(sqlAll('SELECT * FROM streak_shields').length, 0); ok('Worker: rechaza repetir un día, anterior al primer reto, sin protectores y un día ya libre');
// un perfil no puede borrarlos ni ver los de otro
await addShield('alex', yesterday);
await assert.rejects(removeShield('alex', yesterday)); switchTo('other'); assert.deepEqual(await listShieldDays('alex'), []); switchTo('child'); assert.deepEqual(await listShieldDays('alex'), [yesterday]); ok('perfil: no puede quitar protectores y solo ve los suyos');

// --- Efecto: ya no queda protector, la racha sigue y los puntos/Worker lo cuentan ---
status = await loadRetoStatus('alex');
assert.equal(status.shields.available, 0); assert.deepEqual(status.missed, []); assert.equal(status.streak, 10); ok('tras usarlo: 0 protectores y la racha sigue en 10');
const bar = (await import('../js/features/reto/shield/shield-bar.js')).shieldBar;
assert.equal(bar({ profile: { id: 'alex' }, status }), null); ok('sin protectores no sale la franja');

// --- Pantalla: franja y diálogo ---
db.sqlite.exec(`DELETE FROM streak_shields`); switchTo('child');
status = await loadRetoStatus('alex');
const app = document.getElementById('app');
app.replaceChildren(bar({ profile: { id: 'alex', name: 'Alex' }, status }));
assert.match(app.textContent, /Tienes 1 protector de racha/); assert.match(app.textContent, /Puedes salvar un día/);
app.querySelector('button').click(); await sleep(50);
const modal = document.querySelector('.modal'); assert.match(modal.textContent, /¿Qué día quieres proteger\?/);
const buttons = [...modal.querySelectorAll('.btn')]; assert.match(buttons.at(-1).textContent, /Cancelar/);
assert.equal(buttons.length, 2); // ayer + cancelar
buttons.at(-1).click(); await sleep(60); assert.equal(sqlAll('SELECT * FROM streak_shields').length, 0); ok('franja con el contador y diálogo con el día perdido; Cancelar no gasta nada');
app.querySelector('button').click(); await sleep(50);
[...document.querySelectorAll('.modal .btn')][0].click(); await sleep(250);
assert.ok(document.querySelector('.modal--success')); assert.match(document.querySelector('.modal').textContent, /Racha salvada/);
document.querySelector('.modal .btn').click(); await sleep(60);
assert.deepEqual(sqlAll('SELECT day FROM streak_shields').map((r) => r.day), [yesterday]); ok('elegir el día gasta el protector y lo confirma');

// --- Zona de padres ---
switchTo('parent');
const { loadShieldInfo } = await import('../js/features/reto/shield/load-shield-info.js');
const info = await loadShieldInfo('alex');
assert.deepEqual({ earned: info.earned, used: info.used, available: info.available, days: info.shieldDays }, { earned: 1, used: 1, available: 0, days: [yesterday] });
const { shieldsSection } = await import('../js/features/parents/child-stats/shields-section.js');
const section = shieldsSection({ profile: { id: 'alex', name: 'Alex' }, info });
app.replaceChildren(section);
assert.match(section.textContent, /Alex tiene 0 protectores \(ganados 1, usados 1\)/); assert.match(section.textContent, /cada 10 días/); assert.equal(section.querySelectorAll('.free-days__row').length, 1);
section.querySelector('.free-days__row button').click(); await sleep(250);
assert.equal(sqlAll('SELECT * FROM streak_shields').length, 0); assert.match(section.textContent, /Alex tiene 1 protector \(ganados 1, usados 0\)/); assert.match(section.textContent, /Aún no ha usado ningún protector/); ok('padres: ven protectores y días salvados, y pueden quitar uno (vuelve a estar disponible)');

// --- Puntos y lista de perfiles del Worker cuentan los días protegidos ---
db.sqlite.exec(`INSERT INTO streak_shields (id,profile_id,day) VALUES ('s1','alex','${yesterday}')`);
const { protectedDaysOf } = await import('../worker/shield-data.js');
assert.deepEqual(await protectedDaysOf(db, 'alex'), [yesterday]);
const profilesRes = await parentWorker.fetch(new Request('https://w.example/auth/profiles', { headers: { 'X-Api-Key': 'k' } }), env, { waitUntil() {} });
assert.equal(profilesRes.status, 200); ok('Worker: días protegidos se unen a los libres para racha, puntos y recordatorios');

// --- Copias antiguas ---
const { checkBackup } = await import('../js/features/backup/check-backup.js');
const old = { app: 'aprende-y-juega', format: 1, created_at: '2026-11-01T10:00:00Z', tables: { profiles: [], practice_sessions: [], answers: [], study_progress: [], topic_release: [], reto_diario: [] } };
assert.deepEqual(checkBackup(old).tables.streak_shields, []);
const { buildBackup } = await import('../js/features/backup/build-backup.js'); const made = await buildBackup(); assert.equal(made.tables.streak_shields.length, 1); ok('copias: la nueva incluye los protectores y las antiguas siguen valiendo');

// --- Worker sin la tabla creada ---
db.sqlite.exec('DROP TABLE streak_shields');
assert.deepEqual(await protectedDaysOf(db, 'alex'), []);
const again = await parentWorker.fetch(new Request('https://w.example/auth/profiles', { headers: { 'X-Api-Key': 'k' } }), env, { waitUntil() {} });
assert.equal(again.status, 200); ok('Worker nuevo sin la tabla streak_shields: todo sigue funcionando');
console.log(`\n${n} comprobaciones OK`);
