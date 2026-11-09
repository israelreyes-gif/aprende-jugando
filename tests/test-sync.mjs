// Sincronización: la app anota los guardados con retraso o fallidos, la zona de padres y el resumen semanal los cuentan,
// y un guardado fallido avisa a los padres.
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://app.example/' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage });
const R = new URL('../js', import.meta.url).pathname;
const { summarizeSync, weekActivity } = await import(`${R}/features/parents/child-stats/sync-summary.js`);
const { syncSection } = await import(`${R}/features/parents/child-stats/sync-section.js`);
const { setConnection } = await import(`${R}/core/api/connection.js`);
const { queueInsert, flushOutbox } = await import(`${R}/core/api/outbox.js`);
const { readOutbox } = await import(`${R}/core/api/outbox-store.js`);
import { formatProfile } from '../worker/report-format.js';
import worker from './parent-worker.js';
import { makeD1 } from './d1-shim.js';

let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };

// ---- Resumen de la zona de padres
const now = Date.parse('2026-11-02T12:00:00Z');
const ev = (outcome, iso, what = 'practice_sessions', detail = 'sin conexión') => ({ outcome, created_at: iso, what, detail });
const s = summarizeSync([ev('late', '2026-11-01T10:00:00Z'), ev('late', '2026-11-01T11:00:00Z'), ev('failed', '2026-11-01T17:42:00Z'), ev('failed', '2026-10-01T10:00:00Z')], 20, now);
assert.deepEqual([s.ok, s.late, s.failed], [17, 2, 1]); assert.equal(s.last.created_at, '2026-11-01T17:42:00Z'); ok('cuenta solo los últimos 7 días: 17 a la primera, 2 con retraso, 1 sin guardar');
assert.deepEqual(summarizeSync([], 0, now), { ok: 0, late: 0, failed: 0, last: null }); ok('sin datos: todo a 0 y sin último fallo');
assert.equal(summarizeSync([ev('late', '2026-11-01T10:00:00Z')], 0, now).ok, 0); ok('"a la primera" nunca sale negativo');
assert.equal(weekActivity([{ finished_at: '2026-11-01T10:00:00Z' }, { finished_at: '2026-09-01T10:00:00Z' }], 'finished_at', now), 1); ok('actividad de la semana');
const good = syncSection(summarizeSync([], 12, now), 'Alex'); assert.match(good.textContent, /Todo guardado ✅/); assert.match(good.textContent, /Sin guardar0/); assert.equal(good.querySelector('.sync-card__note'), null); ok('tarjeta "todo guardado"');
const bad = syncSection(s, 'Alex'); assert.match(bad.textContent, /Revisar ⚠️/); assert.match(bad.querySelector('.sync-card__note').textContent, /Último fallo de Alex.*un ejercicio \(sin conexión\)/); ok('tarjeta con avisos y último fallo');

// ---- La app anota los guardados (sin contenido de respuestas)
const calls = [];
setConnection('https://api.example', 'k');
let mode = 'offline';
globalThis.fetch = async (url, init) => {
  const body = init.body ? JSON.parse(init.body) : null;
  calls.push({ url: String(url), body });
  if (String(url).includes('/api/sync_events')) return new Response('[]', { status: 201 });
  if (mode === 'offline') throw new TypeError('Failed to fetch');
  if (mode === 'rejected') return new Response(JSON.stringify({ error: 'Datos no válidos' }), { status: 400 });
  return new Response('{}', { status: 201 });
};
const events = () => calls.filter((c) => c.url.includes('/api/sync_events')).flatMap((c) => c.body);
const tick = () => new Promise((r) => setTimeout(r, 10));

let r = await queueInsert('practice_sessions', { id: 'a', profile_id: 'p1' }, { profileId: 'p1' });
assert.equal(r.queued, true); assert.equal(readOutbox().length, 1); assert.equal(events().length, 0); ok('sin conexión: queda en cola y todavía no se anota nada');
mode = 'online'; await flushOutbox(); await tick();
assert.equal(readOutbox().length, 0); assert.equal(events().length, 1);
assert.deepEqual([events()[0].outcome, events()[0].what, events()[0].profile_id], ['late', 'practice_sessions', 'p1']); ok('al volver la conexión se guarda y se anota como "late" del perfil');

mode = 'online'; r = await queueInsert('study_progress', { id: 'b' }, { profileId: 'p1' }); await tick();
assert.equal(r.queued, false); assert.equal(events().length, 1); ok('guardado a la primera: no se anota nada');

mode = 'offline'; await queueInsert('practice_sessions', { id: 'c' }, { profileId: 'p1' }); mode = 'rejected'; await flushOutbox(); await tick();
assert.equal(readOutbox().length, 0); const f = events().at(-1);
assert.deepEqual([f.outcome, f.what, f.detail, f.profile_id], ['failed', 'practice_sessions', 'error 400', 'p1']); ok('si el servidor lo rechaza se descarta y se anota como "failed"');
assert.deepEqual(Object.keys(f).sort(), ['detail', 'id', 'outcome', 'profile_id', 'what']); ok('solo se anotan qué, motivo corto y perfil: nada de contenido');

mode = 'rejected'; await assert.rejects(queueInsert('study_progress', { id: 'd' }, { profileId: 'p1' })); await tick();
assert.equal(events().at(-1).outcome, 'failed'); ok('rechazo inmediato: también se anota');

// ---- Una sesión caducada solo aparca las escrituras de su perfil
{
  localStorage.setItem('aj.outbox', '[]');
  mode = 'offline';
  await queueInsert('practice_sessions', { id: 'x1' }, { profileId: 'caducado' });
  await queueInsert('practice_sessions', { id: 'y1' }, { profileId: 'vivo' });
  await queueInsert('study_progress', { id: 'x2' }, { profileId: 'caducado' });
  const saved = [];
  globalThis.fetch = async (url, init) => {
    const u = String(url);
    if (u.includes('/api/sync_events')) return new Response('[]', { status: 201 });
    if ((init.body || '').includes('"id":"x')) return new Response(JSON.stringify({ error: 'Sesión no válida' }), { status: 401 });
    saved.push(JSON.parse(init.body).id || JSON.parse(init.body)[0]?.id);
    return new Response('{}', { status: 201 });
  };
  await tick(); await flushOutbox(); await tick();
  assert.deepEqual(readOutbox().map((i) => i.rows.id), ['x1', 'x2']); assert.equal(saved.length, 1);
  ok('con la sesión de un perfil caducada, las escrituras de otro perfil se guardan y las suyas se conservan en orden');
}

// ---- Resumen semanal de Telegram: siempre la línea de sincronización
const base = { name: 'Alex', gender: 'chico', courseId: null, streak: 0, retoDays: 0, weekDays: 7, newTopics: 0, studied: 0, released: 0, reinforce: [] };
const syncLineOf = (sync) => formatProfile({ ...base, sync }).split('\n').at(-1);
assert.equal(syncLineOf({ activity: 10, late: 0, failed: 0 }), '🔄 Sincronización: todo guardado ✅');
assert.equal(syncLineOf({ activity: 10, late: 2, failed: 0 }), '🔄 Sincronización: ✅ todo guardado (2 con retraso)');
assert.equal(syncLineOf({ activity: 10, late: 11, failed: 2 }), '🔄 Sincronización: ⚠️ 11 con retraso, 2 sin guardar');
assert.equal(syncLineOf({ activity: 0, late: 0, failed: 0 }), '🔄 Sincronización: sin datos esta semana');
assert.equal(syncLineOf(undefined), '🔄 Sincronización: sin datos esta semana'); ok('línea de Telegram: 4 estados y siempre presente');
assert.match(formatProfile({ ...base, sync: { activity: 1, late: 1, failed: 2 } }, new Map(), { b: (x) => `<b>${x}</b>`, x: (x) => x }), /<b>2 sin guardar<\/b>/); ok('lo sin guardar sale en negrita');

// ---- Worker: un "failed" avisa a los padres; un "late" no
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname);
db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color) VALUES ('p1','Alex','#fff')`);
const telegram = [];
globalThis.fetch = async (url, init) => { telegram.push(JSON.parse(init.body)); return new Response('{}', { status: 200 }); };
const env = { DB: db, API_KEY: 'k', TELEGRAM_BOT_TOKEN: 'T', TELEGRAM_CHAT_ID: '-1' };
const post = async (rows) => { const pending = []; const res = await worker.fetch(new Request('https://w.example/api/sync_events', { method: 'POST', headers: { 'X-Api-Key': 'k', 'Content-Type': 'application/json' }, body: JSON.stringify(rows) }), env, { waitUntil: (p) => pending.push(p) }); await Promise.all(pending); return res; };
assert.equal((await post([{ id: 'e1', profile_id: 'p1', outcome: 'late', what: 'practice_sessions' }])).status, 201); assert.equal(telegram.length, 0); ok('un guardado con retraso se registra sin avisar');
assert.equal((await post([{ id: 'e2', profile_id: 'p1', outcome: 'failed', what: 'practice_sessions', detail: 'error 400' }])).status, 201);
assert.equal(telegram.length, 1); assert.match(telegram[0].text, /No se pudo guardar/); assert.match(telegram[0].text, /Alex/); assert.match(telegram[0].text, /practice_sessions/); ok('un guardado fallido avisa a Telegram con el nombre del perfil');
assert.equal((await post([{ id: 'e3', profile_id: null, outcome: 'otra-cosa', what: 'x' }])).status, 400); ok('un resultado no permitido se rechaza');
assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM sync_events').get().n, 2); ok('quedan guardados los 2 eventos válidos');

console.log(`${n} comprobaciones de sincronización correctas`);
