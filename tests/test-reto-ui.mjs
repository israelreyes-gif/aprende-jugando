import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'https://yo.github.io/aprende/', pretendToBeVisual: true });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, location: window.location, localStorage: window.localStorage, sessionStorage: window.sessionStorage });
window.scrollTo = () => {};
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname); const env = { DB: db, API_KEY: 'k' };
let offline = false;
globalThis.fetch = async (url, init = {}) => { if (offline && init.method === 'PATCH') throw new TypeError('fetch failed'); return worker.fetch(new Request(url, init), env); };
const errors = []; console.error = (...a) => errors.push(a.map(String).join(' '));

const { setConnection } = await import('../js/core/api.js'); setConnection('https://w.example', 'k');
const { reload } = await import('../js/core/router.js');
const { spainDay } = await import('../js/features/reto/streak/date-keys.js');
const app = () => document.getElementById('app'); const text = () => app().textContent;
const q = (s) => app().querySelector(s); const qa = (s) => [...app().querySelectorAll(s)];
const rows = (sql, ...a) => db.sqlite.prepare(sql).all(...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function settle() { await sleep(25); for (let i = 0; i < 400; i++) { if (!q('.spinner')) { await sleep(15); if (!q('.spinner')) return; } await sleep(10); } throw new Error('cargando…'); }
async function visit(h) { if (location.hash === h) reload(); else location.hash = h; await settle(); }
const type = (el, v) => { el.value = v; el.dispatchEvent(new window.Event('input', { bubbles: true })); };
let steps = 0; const ok = (n) => { steps++; console.log('  ✓', n); };

await import('../js/main.js'); await settle();
db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color) VALUES ('alex','Alex','#8EDBC0')`);
const TOPICS = [['mates', 'tablas'], ['sociales', 'relieve'], ['ingles', 'verb-to-be'], ['lengua', 'sustantivo'], ['sciences', 'human-body']];
const byPrompt = new Map();
for (const [s, t] of TOPICS) for (const e of (await import(`../js/content/4-primaria/${s}/${t}/exercises.js`)).exercises) byPrompt.set(e.prompt, e);
const course = '#/p/alex/c/4-primaria'; const reto = course + '/reto';

await visit(course);
assert.ok(q('a.reto-card')); assert.match(q('.reto-card').textContent, /Reto de hoy/); assert.match(text(), /10 preguntas de todas las asignaturas/); assert.match(q('.reto-card__cta').textContent, /Empezar el reto/); assert.equal(q('.streak'), null);
assert.equal(q('a.reto-card').getAttribute('href'), reto); ok('asignaturas: tarjeta "Reto de hoy" con "Empezar el reto" y sin racha todavía');
assert.equal(qa('a.row-card').length, 5); ok('las 5 asignaturas siguen apareciendo');

await visit(reto);
assert.match(text(), /Todavía no hay temas liberados/); assert.equal(rows('SELECT * FROM reto_diario').length, 0); assert.ok(q('a.btn[href="' + course + '"]')); ok('sin temas liberados: aviso y no se crea ningún reto');

for (const [s, t] of TOPICS) db.sqlite.prepare(`INSERT INTO topic_release (id, profile_id, course_id, subject_id, topic_id) VALUES (?, 'alex', '4-primaria', ?, ?)`).run('r' + s, s, t);
await visit(reto);
assert.match(text(), /Estudia primero algún tema liberado para desbloquear el reto/); assert.doesNotMatch(text(), /Todavía no hay temas liberados/); assert.equal(rows('SELECT * FROM reto_diario').length, 0); ok('temas liberados pero sin estudiar: "Estudia primero…" y no se crea ningún reto');
const [s0, t0] = TOPICS[0]; db.sqlite.prepare(`INSERT INTO study_progress (id, profile_id, course_id, subject_id, topic_id, completed_at) VALUES ('st0', 'alex', '4-primaria', ?, ?, '2026-10-20T10:00:00Z')`).run(s0, t0);
await visit(reto); const only = JSON.parse(rows('SELECT * FROM reto_diario')[0].questions); assert.equal(only.every((p) => p.topicId === t0), true); assert.ok(only.length >= 1 && only.length <= 10); assert.match(text(), new RegExp(`(Pregunta|Question) 1 (de|of) ${only.length}`)); ok(`con un solo tema estudiado, todas las preguntas son de ese tema (${only.length}, las que tiene el tema)`); db.sqlite.exec('DELETE FROM reto_diario');
for (const [s, t] of TOPICS.slice(1)) db.sqlite.prepare(`INSERT INTO study_progress (id, profile_id, course_id, subject_id, topic_id, completed_at) VALUES (?, 'alex', '4-primaria', ?, ?, '2026-10-20T10:00:00Z')`).run('st' + s, s, t);
await visit(reto);
assert.match(text(), /(Pregunta|Question) 1 (de|of) 10/);
let row = rows('SELECT * FROM reto_diario')[0]; const plan = JSON.parse(row.questions);
assert.equal(row.day, spainDay()); assert.equal(plan.length, 10); assert.equal(row.finished_at, null);
for (const [s, t] of TOPICS) assert.equal(plan.filter((p) => p.subjectId === s && p.topicId === t).length, 2); ok('crea el reto del día: 10 preguntas, 2 de cada uno de los 5 temas');

const seen = [];
async function answer(right) {
  const prompt = q('.question__prompt').textContent; const question = byPrompt.get(prompt); assert.ok(question, 'pregunta desconocida: ' + prompt); seen.push(prompt);
  if (question.type === 'choice') { const target = right ? question.options[question.answer] : question.options.find((_, k) => k !== question.answer); qa('.option').find((o) => o.textContent === target).click(); }
  else if (question.type === 'number') type(q('input.input'), right ? String(question.answer) : '999');
  else type(q('input.input'), right ? question.answers[0] : 'zzz');
  const action = q('.practice .btn--primary'); const label = action.textContent; action.click(); await sleep(15); assert.equal(!!q('.feedback--ok'), right); return label;
}
const next = async () => { q('.practice .btn--primary').click(); await sleep(15); };

const labels = new Set();
for (let i = 0; i < 3; i++) { labels.add(await answer(true)); await next(); }
await sleep(40);
assert.equal(JSON.parse(rows('SELECT * FROM reto_diario')[0].answers).length, 3); ok('cada respuesta se guarda al comprobarla (3 de 10 en D1)');
assert.match(text(), /(Pregunta|Question) 4 (de|of) 10/);

await visit(course);
assert.match(text(), /Llevas 3 de 10/); assert.match(q('.reto-card__cta').textContent, /Seguir el reto/); ok('a medias: la tarjeta dice "Llevas 3 de 10" y "Seguir el reto"');
await visit(reto);
assert.match(text(), /(Pregunta|Question) 4 (de|of) 10/); assert.ok(!seen.includes(q('.question__prompt').textContent)); ok('al volver sigue en la pregunta 4 y no repite las ya respondidas');

offline = true; await answer(true); await sleep(60); assert.ok(document.querySelector('.modal--error'), 'debía avisar'); assert.match(document.querySelector('.modal').textContent, /No se pudo guardar/);
document.querySelector('.modal-overlay').click(); offline = false; await next(); ok('si falla el guardado avisa con una ventana roja y deja seguir');

const results = [true, true, false, true, true, true]; // respuestas 6..10 (5 más) + ya llevaba 4
for (let i = 0; i < 6; i++) {
  if (!q('.question__prompt')) break;
  await answer(results[i] ?? true); await next();
}
await sleep(120); await settle();
assert.ok(q('.result__score'), 'debía haber resultado: ' + text().slice(0, 200));
const done = rows('SELECT * FROM reto_diario')[0];
assert.ok(done.finished_at); assert.equal(JSON.parse(done.answers).length, 10); ok('al responder la 10 se termina el reto y se guardan las 10 respuestas');
const sess = rows(`SELECT * FROM practice_sessions WHERE kind='reto'`);
assert.equal(sess.length, 5); assert.equal(sess.reduce((n, s) => n + s.total, 0), 10); assert.ok(sess.every((s) => s.total === 2)); assert.equal(rows('SELECT * FROM answers').length, 10);
const good = rows('SELECT * FROM answers WHERE is_correct=1').length; assert.equal(q('.result__score').textContent, `${good}/10`); ok(`las respuestas pasan a las estadísticas de cada tema (5 sesiones "reto" de 2) · nota ${good}/10`);
assert.ok(q('.streak')); assert.equal(q('.streak b').textContent, '1'); assert.match(text(), /Vuelve mañana/); assert.equal(qa('.result__item').length, 10 - good); ok('resultado: nota, racha de 1 día y las falladas para repasar');
assert.equal(labels.size >= 1, true);

await visit(course);
assert.ok(q('.reto-card--done')); assert.match(text(), /¡Reto de hoy hecho!/); assert.equal(q('.reto-card--done .streak b').textContent, '1'); assert.equal(q('a.reto-card'), null); ok('asignaturas: tarjeta verde "¡Reto de hoy hecho!" con racha 1 y sin enlace');
await visit(reto);
assert.ok(q('.result__score')); assert.equal(rows('SELECT * FROM reto_diario').length, 1); assert.equal(rows(`SELECT * FROM practice_sessions WHERE kind='reto'`).length, 5); ok('entrar otra vez al reto de hoy solo enseña el resultado, sin repetirlo');

// zona de padres: la racha sustituye a "Días activo" y el reto cuenta en las estadísticas del tema
const { unlock } = await import('../js/features/parents/pin/unlock-state.js'); unlock();
await visit('#/parents/alex');
const chips = qa('.grid-3 .stat-chip'); assert.equal(chips.length, 3);
assert.deepEqual(chips.map((c) => c.querySelector('.stat-chip__label').textContent), ['Ejercicios hechos', 'Acierto medio', 'Días de racha']);
assert.equal(chips[0].querySelector('.stat-chip__value').textContent, '10'); assert.equal(chips[2].querySelector('.stat-chip__value').textContent, '1'); assert.ok(!/Días activo/.test(text())); ok('estadísticas de padres: 10 ejercicios del reto y "Días de racha: 1" en lugar de "Días activo"');
await visit('#/parents/alex/stats/4-primaria/mates');
assert.match(q('.topic-stat').textContent, /Solo preguntas del reto · últimas 24: \d+%/); ok('detalle de Matemáticas: el tema solo con preguntas del reto lo dice y no inventa intentos ni "mejor"');
await visit(course + '/s/mates/practice');
assert.ok(!/⭐/.test(text()), "el reto no debe crear una mejor nota"); assert.match(q('.topic-card').textContent, /Sin intentar/); ok('tarjeta del tema (niño): sigue "Sin intentar" aunque haya preguntas del reto');

// idiomas: los botones salen en el idioma de cada pregunta
db.sqlite.exec(`DELETE FROM reto_diario`); db.sqlite.exec(`DELETE FROM practice_sessions`);
await visit(reto); const langSeen = new Map();
for (let i = 0; i < 10; i++) { const p = byPrompt.get(q('.question__prompt').textContent); const lang = q('.practice').getAttribute('lang'); const label = q('.practice .btn--primary').textContent; langSeen.set(lang, label); await answer(true); await next(); }
await sleep(100); await settle();
assert.equal(langSeen.get('es'), 'Comprobar'); assert.equal(langSeen.get('en'), 'Check'); ok('Inglés y Sciences muestran "Check"; el resto "Comprobar"');

// racha acumulada con días anteriores
const addDays = (await import('../js/features/reto/streak/date-keys.js')).addDays; const today = spainDay();
for (const k of [1, 2, 3]) db.sqlite.prepare(`INSERT INTO reto_diario (id, profile_id, course_id, day, questions, answers, finished_at) VALUES (?, 'alex', '4-primaria', ?, '[]', '[]', 'x')`).run('d' + k, addDays(today, -k));
await visit(course); assert.equal(q('.reto-card--done .streak b').textContent, '4'); ok('racha con días anteriores seguidos: 3 + hoy = 4');
console.log('\n' + steps + ' comprobaciones del reto OK'); if (errors.length) console.log('console.error:', [...new Set(errors)].slice(0, 5));
