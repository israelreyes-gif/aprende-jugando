import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'https://yo.github.io/aprende/', pretendToBeVisual: true });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, location: window.location, localStorage: window.localStorage, sessionStorage: window.sessionStorage });
window.scrollTo = () => {};
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname); const env = { DB: db, API_KEY: 'k' };
const pushes = []; let pushFails = false;
globalThis.fetch = async (url, init = {}) => {
  if (String(url).endsWith('/push/send')) {
    if (pushFails) throw new TypeError('fetch failed');
    pushes.push({ headers: init.headers, ...JSON.parse(init.body) });
    return new Response(JSON.stringify({ ok: true, sent: 1 }), { status: 200 });
  }
  return worker.fetch(new Request(url, init), env);
};
const errors = []; console.error = (...a) => errors.push(a.map(String).join(' '));
const warns = []; console.warn = (...a) => warns.push(a.map(String).join(' '));

const { setConnection } = await import('../js/core/api.js'); setConnection('https://w.example', 'k');
const { reload } = await import('../js/core/router.js');
const app = () => document.getElementById('app'); const text = () => app().textContent;
const q = (s) => app().querySelector(s); const qa = (s) => [...app().querySelectorAll(s)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function settle() { await sleep(25); for (let i = 0; i < 400; i++) { if (!q('.spinner')) { await sleep(15); if (!q('.spinner')) return; } await sleep(10); } throw new Error('cargando…'); }
async function visit(h) { if (location.hash === h) reload(); else location.hash = h; await settle(); }
const type = (el, v) => { el.value = v; el.dispatchEvent(new window.Event('input', { bubbles: true })); };
let steps = 0; const ok = (n) => { steps++; console.log('  ✓', n); };
const { unlock } = await import('../js/features/parents/pin/unlock-state.js'); unlock();
await import('../js/main.js'); await settle();
const { levelFor, levelsFor } = await import('../js/features/points/levels.js');
const { profileCompletion } = await import('../js/features/profiles/profile-completion.js');
const { coursePercent } = await import('../js/features/courses/course-percent.js');

// Lógica
assert.equal(levelFor(250).name, 'Aventurero'); assert.equal(levelFor(250, 'chico').name, 'Aventurero'); assert.equal(levelFor(250, 'chica').name, 'Aventurera'); assert.equal(levelFor(250, null).name, 'Aventurero');
assert.equal(levelFor(250, 'chica').next.name, 'Detective'); assert.equal(levelFor(100, 'chica').next.name, 'Curiosa');
assert.deepEqual(levelsFor('chica').map((l) => l.name), ['Exploradora','Aprendiz','Curiosa','Aventurera','Detective','Inventora','Experta','Campeona','Maestra','Leyenda']);
assert.deepEqual(levelsFor().map((l) => l.name), ['Explorador','Aprendiz','Curioso','Aventurero','Detective','Inventor','Experto','Campeón','Maestro','Leyenda']); ok('niveles en masculino, femenino y sin elegir (masculino)');
assert.deepEqual(profileCompletion({ name: 'A', color: '#1', gender: null, bell: false }), { pct: 50, missing: ['elegir chico o chica', 'activar los avisos'] });
assert.equal(profileCompletion({ name: 'A', color: '#1', gender: 'chica', bell: null }).pct, 75); assert.equal(profileCompletion({ name: ' ', color: '#1', gender: 'chica', bell: true }).pct, 75); assert.equal(profileCompletion({ name: 'A', color: '#1', gender: 'chico', bell: true }).pct, 100); ok('porcentaje del perfil: 25 % por dato');
assert.deepEqual(coursePercent([{ total: 13, studied: 8 }, { total: 3, studied: 1 }, { total: 0, studied: 0 }]), { studied: 9, total: 16, pct: 56, missing: 44 }); assert.equal(coursePercent([]).pct, 0); ok('porcentaje del curso');

// Crear perfil con chica
await visit('#/new-profile');
assert.equal(qa('.gender').length, 2); assert.equal(qa('.gender[aria-pressed="true"]').length, 0); assert.equal(q('.completion'), null); ok('nuevo perfil: dos tarjetas Chico/Chica sin elegir y sin barra de porcentaje');
type(q('#profile-name'), 'Lucía'); qa('.gender')[1].click(); assert.equal(qa('.gender')[1].getAttribute('aria-pressed'), 'true'); assert.equal(qa('.gender')[0].getAttribute('aria-pressed'), 'false');
q('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })); await sleep(300); await settle();
const row = db.sqlite.prepare("SELECT id, name, gender FROM profiles WHERE name='Lucía'").get(); assert.equal(row.gender, 'chica'); ok('se guarda gender = chica');

// Editar: barra, 75 % (falta el aviso)
await visit(`#/p/${row.id}/edit`); await sleep(100);
assert.ok(q('.completion')); assert.match(q('.completion').textContent, /Perfil al 75 %/); assert.match(q('.completion').textContent, /Te falta: activar los avisos/); assert.equal(qa('.gender')[1].getAttribute('aria-pressed'), 'true'); ok('editar: "Perfil al 75 %", falta activar los avisos, Chica marcada');
qa('.gender')[0].click(); qa('.gender')[1].click(); assert.match(q('.completion').textContent, /75 %/);
db.sqlite.exec("INSERT INTO profiles (id,name,avatar_color) VALUES ('alex','Alex','#8EDBC0')");
await visit('#/p/alex/edit'); assert.match(q('.completion').textContent, /Perfil al 50 %/); assert.match(q('.completion').textContent, /elegir chico o chica, activar los avisos/); qa('.gender')[0].click(); assert.match(q('.completion').textContent, /Perfil al 75 %/); ok('sin género: 50 %; al elegir chico sube a 75 % al instante');
q('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })); await sleep(300);
assert.equal(db.sqlite.prepare("SELECT gender g FROM profiles WHERE id='alex'").get().g, 'chico'); ok('editar guarda el género');

// Niveles en femenino y porcentaje del curso
for (const [s, t, id] of [['mates', 'tablas', 'a'], ['sociales', 'relieve', 'b']]) { db.sqlite.prepare("INSERT OR IGNORE INTO topic_release (id, profile_id, course_id, subject_id, topic_id) VALUES (?, ?, '4-primaria', ?, ?)").run('rl' + id, row.id, s, t); db.sqlite.prepare("INSERT INTO study_progress (id, profile_id, course_id, subject_id, topic_id, completed_at) VALUES (?, ?, '4-primaria', ?, ?, '2026-10-20T10:00:00Z')").run('sp' + id, row.id, s, t); }
for (let i = 0; i < 23; i++) db.sqlite.prepare("INSERT INTO study_progress (id, profile_id, course_id, subject_id, topic_id, completed_at) VALUES (?, ?, 'x', 'x', ?, '2026-10-20T10:00:00Z')").run('f' + i, row.id, 't' + i);
await visit(`#/p/${row.id}`); await sleep(100);
const card = q('.level-card'); assert.ok(card); assert.match(card.textContent, /NIVEL 4Aventurera250 puntos/); ok('Lucía (250 pts): ' + card.textContent);
assert.ok(q('.course-meter--card')); assert.match(q('.course-meter--card').textContent, /Curso \d+ %/); ok('tarjeta de nivel con el porcentaje del curso: ' + q('.course-meter--card').textContent);
await visit(`#/p/${row.id}/levels`); assert.ok(qa('.level-row__name').map((e) => e.textContent).includes('4 · Aventurera')); assert.ok(!qa('.level-row__name').map((e) => e.textContent).includes('4 · Aventurero')); ok('pantalla de niveles de Lucía en femenino');
await visit('#/p/alex/levels'); assert.ok(qa('.level-row__name').map((e) => e.textContent).includes('4 · Aventurero')); ok('pantalla de niveles de Alex en masculino');

// Inicio: tarjetas de color con el nivel
db.sqlite.prepare("UPDATE profiles SET gender='chico' WHERE id='alex'").run();
for (let i = 0; i < 29; i++) db.sqlite.prepare("INSERT INTO study_progress (id, profile_id, course_id, subject_id, topic_id, completed_at) VALUES (?, 'alex', 'x', 'x', ?, '2026-10-20T10:00:00Z')").run('h' + i, 'ht' + i);
await visit('#/'); await sleep(100);
const cards = qa('.profile-item .profile-card'); assert.equal(cards.length, 2);
const chipOf = (name) => cards.find((c) => c.textContent.includes(name)).querySelector('.level-chip').textContent;
assert.equal(chipOf('Alex'), '🧭 Aventurero'); assert.equal(chipOf('Lucía'), '🧭 Aventurera'); ok('inicio: etiqueta de nivel de cada perfil, en masculino y femenino');
assert.ok(cards.every((c) => c.style.getPropertyValue('--pc'))); assert.equal(q('.profile-card--add').textContent, 'Añadir perfil'); ok('inicio: cada tarjeta lleva el color de su perfil y "Añadir perfil"');

// Zona de padres
await visit('#/parents'); await sleep(100);
assert.match(text(), /Perfil al 75 %/); ok('zona de padres: chip "Perfil al X %" en cada perfil: ' + qa('.profile-chip').map((c) => c.textContent).join(' | '));
await visit(`#/parents/p/${row.id}`).catch(() => {});
console.log('\n' + steps + ' comprobaciones OK'); console.log('errores:', errors.filter((e) => !/Experimental/.test(e))); process.exit(0);
