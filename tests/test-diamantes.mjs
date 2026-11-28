// Diamantes de racha: cálculo (app y Worker iguales), avisos, reglas del Worker, tarjeta del reto, ventanas y zona de padres.
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import parentWorker from './parent-worker.js';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';
import { createSession } from '../worker/auth-sessions.js';
import { shieldBalance } from '../js/features/reto/diamonds/shield-balance.js';
import { shieldBalance as workerBalance } from '../worker/shield-balance.js';
import { streakAlert } from '../js/features/reto/diamonds/streak-alert.js';
import { diamondProgress } from '../js/features/reto/diamonds/diamond-progress.js';
import { addDays, spainDay } from '../js/features/reto/streak/date-keys.js';

let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };
const run = (start, count) => Array.from({ length: count }, (_, i) => addDays(start, i));
const sh = (day, usedOn = addDays(day, 1)) => ({ day, created_at: `${usedOn}T12:00:00Z` }); // diamante que protege `day` y se usó en `usedOn`
const bal = (d, f, s) => { const { earned, used, lost, available } = shieldBalance(d, f, s); return { earned, used, lost, available }; };

// --- Cálculo: 1 diamante cada 30 días de racha, máximo 3 guardados ---
assert.deepEqual(bal(run('2026-01-01', 29), [], []), { earned: 0, used: 0, lost: 0, available: 0 });
assert.deepEqual(bal(run('2026-01-01', 30), [], []), { earned: 1, used: 0, lost: 0, available: 1 });
assert.deepEqual(bal(run('2026-01-01', 90), [], []), { earned: 3, used: 0, lost: 0, available: 3 });
assert.deepEqual(bal(run('2026-01-01', 120), [], []), { earned: 4, used: 0, lost: 1, available: 3 }); ok('se gana uno en las rachas 30, 60 y 90; con 3 guardados el siguiente se pierde');
assert.deepEqual(bal(run('2026-01-01', 120), [], [sh('2027-06-01', '2026-04-10')]), { earned: 4, used: 1, lost: 0, available: 3 }); // usa uno el día 100 → el 120 gana otro
assert.deepEqual(bal(run('2026-01-01', 120), [], [sh('2027-06-01', '2026-05-10')]), { earned: 4, used: 1, lost: 1, available: 2 }); // lo usa después de perder el 4.º
assert.equal(shieldBalance(run('2026-01-01', 30), [], [sh('2027-06-01'), sh('2027-06-02')]).available, 0, 'nunca baja de 0'); ok('gastar uno antes de llegar al tope libera hueco; después, no recupera el perdido');
// una racha rota no cuenta como seguida: 25 + fallo + 25 → ninguna llega a 30
assert.equal(shieldBalance([...run('2026-01-01', 25), ...run('2026-02-01', 25)], [], []).earned, 0);
// un día protegido sigue la racha: 25 + (1 día protegido) + 6 → el día 31 cuenta como 31
assert.equal(shieldBalance([...run('2026-01-01', 25), ...run('2026-01-27', 6)], [], [sh('2026-01-26', '2026-01-27')]).earned, 1); ok('un día protegido sigue la racha y puede completar los 30 días');

// --- Paridad con el Worker (azar) ---
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let round = 0; round < 120; round++) {
  const d = [], f = [], s = [];
  for (let i = 0; i < 400; i++) { const day = addDays('2026-01-01', i); const r = rnd(); if (r < 0.93) d.push(day); else if (r < 0.96) f.push(day); else if (r < 0.985) s.push(sh(day, addDays(day, Math.floor(rnd() * 30)))); }
  assert.deepEqual(shieldBalance(d, f, s), workerBalance(d, f, s));
}
ok('la copia del Worker calcula lo mismo (120 casos al azar, con tope y usos en distintos días)');

// --- Qué hay que contar tras no hacer el reto ---
const T = '2026-11-28'; const Y = '2026-11-27';
const al = (done, available = 1, protectedDays = []) => streakAlert({ doneDays: done, protectedDays, available, today: T });
assert.deepEqual(al(run('2026-11-20', 7)), { kind: 'save', streak: 7, day: Y });
assert.deepEqual(al(run('2026-11-20', 7), 0), { kind: 'lost', streak: 7, day: Y });
assert.deepEqual(al(run('2026-11-20', 6)), { kind: 'lost-two', streak: 6 }, 'falló anteayer y ayer: se rompe directamente');
assert.equal(al(run('2026-11-20', 7), 1, [Y]), null, 'ayer era libre o ya estaba protegido');
assert.equal(al(run('2026-11-20', 8)), null, 'ayer sí lo hizo');
assert.equal(al([]), null); assert.equal(al(run('2026-11-10', 3)), null, 'sin racha viva no hay nada que contar');
assert.equal(al([...run('2026-11-20', 4), '2026-11-27'], 1, ['2026-11-25', '2026-11-26']), null);
ok('avisos: salvar con diamante, racha rota sin diamantes, dos días seguidos y los casos en que no hay aviso');
assert.deepEqual(diamondProgress(0), { nextAt: 30, ratio: 0 }); assert.deepEqual(diamondProgress(15), { nextAt: 30, ratio: 0.5 }); assert.deepEqual(diamondProgress(30), { nextAt: 60, ratio: 0 }); assert.equal(diamondProgress(59).nextAt, 60); ok('progreso al siguiente diamante');

// --- Entorno con Worker ---
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'https://yo.github.io/aprende/', pretendToBeVisual: true });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, location: window.location, localStorage: window.localStorage, sessionStorage: window.sessionStorage });
window.scrollTo = () => {};
const { setSession } = await import('../js/core/api/session-store.js'); setSession('parent', 'test');
const db = makeD1(new URL('../worker/schema.sql', import.meta.url).pathname); const env = { DB: db, API_KEY: 'k' };
const sqlAll = (q, ...a) => db.sqlite.prepare(q).all(...a);
let who = 'parent'; const tokens = {};
globalThis.fetch = async (url, init = {}) => {
  if (who === 'parent') return parentWorker.fetch(new Request(url, init), env, { waitUntil() {} });
  const headers = new Headers(init.headers); headers.set('X-Session', tokens[who]);
  return worker.fetch(new Request(url, { ...init, headers }), env, { waitUntil() {} });
};
const { setConnection } = await import('../js/core/api.js'); setConnection('https://w.example', 'k');
const { clearMemoryCache } = await import('../js/core/api/memory-cache.js');
const { route, start } = await import('../js/core/router.js');
route('/', async () => document.createElement('div')); await start(document.getElementById('app'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const switchTo = (w) => { who = w; clearMemoryCache(); };
const today = spainDay(); const yesterday = addDays(today, -1);
const mk = async (id) => { db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color) VALUES ('${id}','${id}','#000')`); tokens[id] = await createSession(db, id); };
const fin = (profile, day) => db.sqlite.prepare(`INSERT INTO reto_diario (id,profile_id,course_id,day,questions,answers,finished_at) VALUES (?,?,?,?,?,?,?)`).run(`r-${profile}-${day}`, profile, '4-primaria', day, '[]', '[]', `${day}T10:00:00Z`);
const doneRun = (profile, from, to) => { for (let back = from; back >= to; back--) fin(profile, addDays(today, -back)); }; // desde hoy-from hasta hoy-to
const post = async (profile, day) => (await worker.fetch(new Request('https://w.example/api/streak_shields', { method: 'POST', headers: { 'X-Api-Key': 'k', 'Content-Type': 'application/json', 'X-Session': tokens[profile] }, body: JSON.stringify({ id: `d-${profile}-${day}`, profile_id: profile, day }) }), env, { waitUntil() {} })).status;

for (const id of ['alex', 'mia', 'dos', 'cap', 'earn', 'max', 'libre']) await mk(id);
doneRun('alex', 31, 2);   // 30 retos seguidos hasta anteayer; ayer falló → 1 diamante ganado y salvable
doneRun('mia', 10, 2);    // racha viva pero sin diamantes
doneRun('dos', 40, 3);    // 38 días y fallaron anteayer y ayer
doneRun('cap', 99, 2);    // 98 días: 3 diamantes (30, 60, 90)
doneRun('earn', 29, 0);   // 30 días con hoy incluido
doneRun('max', 119, 0);   // 120 días con hoy incluido
doneRun('libre', 31, 2); db.sqlite.exec(`INSERT INTO free_days (id,profile_id,day) VALUES ('f1','libre','${yesterday}')`);

// --- Reglas del Worker (perfil) ---
const rejected = async (profile, day, why) => { assert.equal(await post(profile, day), 400, why); };
await rejected('alex', today, 'hoy no'); await rejected('alex', addDays(today, 1), 'mañana no'); await rejected('alex', addDays(today, -2), 'anteayer no: un diamante solo salva ayer');
await rejected('alex', addDays(today, -5), 'ni un día más antiguo'); await rejected('alex', '2026-13-45', 'fecha inventada'); await rejected('alex', '', 'vacío');
await rejected('mia', yesterday, 'sin diamantes no'); await rejected('dos', yesterday, 'dos días seguidos: la racha ya se rompió'); await rejected('libre', yesterday, 'ayer ya era libre');
assert.equal(sqlAll('SELECT * FROM streak_shields').length, 0); ok('Worker: rechaza hoy, futuro, anteayer, antiguos, fecha falsa, sin diamantes, dos días seguidos y un día libre');
assert.equal(await post('alex', yesterday), 201); assert.deepEqual(sqlAll('SELECT day FROM streak_shields').map((r) => r.day), [yesterday]); ok('Worker: acepta ayer cuando hay diamante y la racha sigue viva');
await rejected('alex', yesterday, 'ya protegido y sin diamantes');
await rejected('cap', addDays(today, -3), 'solo ayer');
assert.equal(await post('cap', yesterday), 201); ok('Worker: con 98 días de racha (3 diamantes ganados) se puede usar uno');
// no se puede crear a nombre de otro, ni quitar, ni ver los de otro
switchTo('alex'); const { removeShield, listShields, addShield } = await import('../js/data/shields.repo.js');
await assert.rejects(addShield('mia', yesterday)); await assert.rejects(removeShield('alex', yesterday)); assert.deepEqual((await listShields('alex')).map((r) => r.day), [yesterday]);
switchTo('mia'); assert.deepEqual(await listShields('alex'), []); ok('perfil: no crea a nombre de otro, no quita diamantes y solo ve los suyos');
db.sqlite.exec(`DELETE FROM streak_shields`); switchTo('parent');

// --- Estado del reto ---
const { loadRetoStatus } = await import('../js/features/reto/reto-status.js');
let st = await loadRetoStatus('alex');
assert.equal(st.streak, 0); assert.deepEqual(st.alert, { kind: 'save', streak: 30, day: yesterday }); assert.deepEqual(st.diamonds, { available: 1, max: 3, nextAt: 30, ratio: 0 }); assert.equal(st.earned, null); ok('estado: ayer fallado con racha de 30 y 1 diamante → aviso para salvarla');
st = await loadRetoStatus('mia'); assert.equal(st.alert.kind, 'lost'); st = await loadRetoStatus('dos'); assert.deepEqual([st.alert.kind, st.alert.streak], ['lost-two', 38]); ok('estado: sin diamantes → racha rota; dos días seguidos → racha rota directamente');
st = await loadRetoStatus('earn'); assert.equal(st.streak, 30); assert.equal(st.earned, 'earned'); assert.equal(st.alert, null);
st = await loadRetoStatus('max'); assert.equal(st.streak, 120); assert.equal(st.earned, 'earned-max'); assert.equal(st.diamonds.available, 3); ok('estado: completar la racha 30 gana un diamante; con 3 guardados, el 4.º se pierde');

// --- Tarjeta del reto ---
const { retoCard } = await import('../js/features/reto/reto-card.js');
const card = (status) => retoCard({ profile: { id: 'alex', name: 'Alex' }, course: { id: '4-primaria' }, status });
const base = { reto: null, streak: 12 };
let el = card({ ...base, diamonds: { available: 2, max: 3, nextAt: 30, ratio: 0.4 } });
assert.equal(el.querySelectorAll('.diamond').length, 3); assert.equal(el.querySelectorAll('.diamond--empty').length, 1); assert.match(el.textContent, /Siguiente diamante en la racha 30/); assert.equal(el.querySelector('.diamond-strip__bar i').style.width, '40%'); assert.equal(el.querySelector('.diamond-strip').getAttribute('aria-label'), '2 de 3 diamantes');
el = card({ ...base, diamonds: { available: 3, max: 3, nextAt: 60, ratio: 0.1 } });
assert.equal(el.querySelectorAll('.diamond--empty').length, 0); assert.match(el.textContent, /Tienes el máximo de diamantes/); assert.equal(el.querySelector('.diamond-strip__bar'), null);
el = card({ reto: { finished: true, plan: [], answers: [] }, streak: 12, diamonds: { available: 0, max: 3, nextAt: 30, ratio: 0.4 } });
assert.equal(el.querySelectorAll('.diamond--empty').length, 3); assert.match(el.textContent, /¡Reto de hoy hecho!/);
assert.doesNotThrow(() => card(null)); ok('tarjeta del reto: tres ranuras (llenas y vacías), cuándo llega el siguiente, barra y máximo; también con el reto hecho');

// --- Aviso dentro de la pantalla y ventanas ---
const { streakBanner, showStreakNotice } = await import('../js/features/reto/diamonds/streak-notices.js');
const profile = { id: 'alex', name: 'Alex' };
st = await loadRetoStatus('alex');
const banner = streakBanner({ profile, status: st });
assert.match(banner.textContent, /Ayer se te escapó el reto/); assert.match(banner.textContent, /racha de 30 días/); assert.match(banner.textContent, /Tienes 1 diamante/);
assert.equal(streakBanner({ profile, status: { ...st, alert: { kind: 'lost', streak: 5 } } }), null); assert.equal(streakBanner({ profile, status: null }), null); ok('aviso en pantalla: solo cuando se puede salvar con un diamante');
const clearSeen = () => { for (const key of Object.keys(localStorage)) if (key.startsWith('aj-aviso:')) localStorage.removeItem(key); }; // solo las marcas de aviso: la conexión también vive en localStorage
const modal = () => document.querySelector('.modal'); const btns = () => [...document.querySelectorAll('.modal .btn')];
clearSeen();
let p = showStreakNotice({ profile, status: st }); await sleep(40);
assert.match(modal().textContent, /Ayer no hiciste el reto/); assert.match(modal().textContent, /racha de 30 días está en peligro/); assert.equal(btns()[0].textContent, 'Usar mi último diamante'); assert.equal(btns()[1].textContent, 'Prefiero no usarlo'); assert.ok(modal().querySelector('svg.diamond'));
btns()[1].click(); assert.equal(await p, 'save'); assert.equal(sqlAll('SELECT * FROM streak_shields').length, 0);
assert.equal(await showStreakNotice({ profile, status: st }), null); ok('ventana "salvar": un solo diamante dice "último", "Prefiero no usarlo" no gasta nada y no se repite el mismo día');
clearSeen(); switchTo('alex');
p = showStreakNotice({ profile, status: st }); await sleep(40); btns()[0].click(); await sleep(300);
assert.match(modal().textContent, /¡Racha salvada!/); assert.match(modal().textContent, /30 días sigue en pie/); btns()[0].click(); assert.equal(await p, 'save');
assert.deepEqual(sqlAll('SELECT day FROM streak_shields').map((r) => r.day), [yesterday]); ok('ventana "salvar": "Usar" gasta el diamante, lo confirma y la racha queda en pie');
switchTo('parent'); st = await loadRetoStatus('alex'); assert.equal(st.alert, null); assert.equal(st.streak, 30); assert.equal(st.diamonds.available, 0); ok('tras usarlo: sin aviso, racha de 30 y 0 diamantes');
const shown = async (status, who2 = profile) => { clearSeen(); const q = showStreakNotice({ profile: who2, status }); await sleep(40); const text = modal().textContent; const gem = modal().querySelector('svg.diamond'); btns()[0].click(); await q; return { text, filled: !gem.classList.contains('diamond--empty') }; };
let r = await shown(await loadRetoStatus('mia')); assert.match(r.text, /Ayer no pudo ser/); assert.match(r.text, /racha de 9 días ha terminado/); assert.match(r.text, /a los 30 ganarás un diamante/); assert.equal(r.filled, false);
r = await shown(await loadRetoStatus('dos')); assert.match(r.text, /Dos días sin reto/); assert.match(r.text, /racha de 38 días se ha roto/); assert.match(r.text, /solo salva un día/);
r = await shown(await loadRetoStatus('earn')); assert.match(r.text, /¡30 días seguidos!/); assert.match(r.text, /Has ganado un diamante/); assert.match(r.text, /hasta 3/); assert.equal(r.filled, true);
r = await shown(await loadRetoStatus('max')); assert.match(r.text, /¡120 días seguidos!/); assert.match(r.text, /máximo de 3 diamantes/); ok('ventanas: racha rota sin diamantes, dos días seguidos, diamante ganado y máximo alcanzado');
assert.equal(await showStreakNotice({ profile, status: { today, streak: 0, alert: null, earned: null, diamonds: {} } }), null); ok('sin nada que contar no sale ventana');

// --- Zona de padres ---
const { loadShieldInfo } = await import('../js/features/reto/diamonds/load-shield-info.js');
const { diamondsSection } = await import('../js/features/parents/child-stats/diamonds-section.js');
db.sqlite.exec(`DELETE FROM streak_shields`); switchTo('alex'); await addShield('alex', yesterday); switchTo('parent');
const info = await loadShieldInfo('alex');
assert.deepEqual({ earned: info.earned, used: info.used, available: info.available, days: info.shieldDays }, { earned: 1, used: 1, available: 0, days: [yesterday] });
const section = diamondsSection({ profile, info }); document.getElementById('app').replaceChildren(section);
assert.match(section.textContent, /Diamantes de racha/); assert.equal(section.querySelectorAll('.diamond').length, 3); assert.equal(section.querySelectorAll('.diamond--empty').length, 3); assert.match(section.textContent, /0 de 3/);
assert.match(section.textContent, /rachas 30, 60 y 90, hasta 3 guardados/); assert.match(section.textContent, /solo salva el día de ayer/); assert.equal(section.querySelectorAll('.free-days__row').length, 1);
section.querySelector('.free-days__row button').click(); await sleep(300);
assert.equal(sqlAll('SELECT * FROM streak_shields').length, 0); assert.match(section.textContent, /1 de 3/); assert.match(section.textContent, /Aún no ha usado ningún diamante/); assert.equal(section.querySelectorAll('.diamond--empty').length, 2); ok('padres: ven las ranuras y los días salvados y pueden quitar un uso (el diamante vuelve)');

// --- Copias antiguas y Worker sin la tabla ---
const { checkBackup } = await import('../js/features/backup/check-backup.js');
const old = { app: 'aprende-y-juega', format: 1, created_at: '2026-11-01T10:00:00Z', tables: { profiles: [], practice_sessions: [], answers: [], study_progress: [], topic_release: [], reto_diario: [] } };
assert.deepEqual(checkBackup(old).tables.streak_shields, []); ok('copias: las antiguas sin diamantes siguen valiendo');
db.sqlite.exec('DROP TABLE streak_shields');
const { protectedDaysOf } = await import('../worker/shield-data.js'); assert.deepEqual(await protectedDaysOf(db, 'libre'), [yesterday]);
const res = await parentWorker.fetch(new Request('https://w.example/auth/profiles', { headers: { 'X-Api-Key': 'k' } }), env, { waitUntil() {} }); assert.equal(res.status, 200); ok('Worker sin la tabla streak_shields: todo sigue funcionando (solo los días libres)');
console.log(`\n${n} comprobaciones OK`);
