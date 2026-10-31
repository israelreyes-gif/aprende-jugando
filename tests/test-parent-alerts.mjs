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

await import('../js/main.js'); await settle();
db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color) VALUES ('alex','Alex','#8EDBC0')`);
const TOPICS = [['mates', 'tablas'], ['sociales', 'relieve'], ['ingles', 'verb-to-be'], ['lengua', 'sustantivo'], ['sciences', 'human-body']];
const byPrompt = new Map();
for (const [s, t] of TOPICS) for (const e of (await import(`../js/content/4-primaria/${s}/${t}/exercises.js`)).exercises) byPrompt.set(e.prompt, e);
for (const [s, t] of TOPICS) db.sqlite.prepare(`INSERT INTO topic_release (id, profile_id, course_id, subject_id, topic_id) VALUES (?, 'alex', '4-primaria', ?, ?)`).run('r' + s, s, t);

async function answer(right) {
  const question = byPrompt.get(q('.question__prompt').textContent); assert.ok(question);
  if (question.type === 'choice') { const target = right ? question.options[question.answer] : question.options.find((_, k) => k !== question.answer); qa('.option').find((o) => o.textContent === target).click(); }
  else if (question.type === 'number') type(q('input.input'), right ? String(question.answer) : '999');
  else type(q('input.input'), right ? question.answers[0] : 'zzz');
  q('.practice .btn--primary').click(); await sleep(15);
  q('.practice .btn--primary').click(); await sleep(15);
}

// 1) Estudio
const tablas = '#/p/alex/c/4-primaria/s/mates';
await visit(`${tablas}/study/tablas`);
assert.equal(pushes.length, 0);
q('.lesson__actions button').click(); await sleep(60);
assert.equal(pushes.length, 1); assert.deepEqual(Object.keys(pushes[0]).sort(), ['body', 'headers', 'title', 'target', 'url'].sort());
assert.equal(pushes[0].target, 'parents'); assert.equal(pushes[0].url, '#/parents'); assert.equal(pushes[0].title, 'Alex ha estudiado'); assert.match(pushes[0].body, /^Matem.* · Tablas de multiplicar · \+10 puntos$/); ok('marcar estudiado: aviso a los padres con el tema y la asignatura → ' + pushes[0].title + ' / ' + pushes[0].body);
q('.lesson__actions button').click(); await sleep(40); assert.equal(pushes.length, 1); ok('pulsar otra vez el botón ya marcado no repite el aviso');

// 2) Ejercicios: todo bien
pushes.length = 0;
await visit(`${tablas}/practice/tablas`);
let n = 0; while (q('.question__prompt')) { await answer(true); n++; }
await sleep(80); assert.ok(q('.result__score'));
assert.equal(pushes.length, 1); assert.equal(pushes[0].title, 'Alex ha practicado'); assert.match(pushes[0].body, new RegExp(`^Matem.* · Tablas de multiplicar · ${n} de ${n} \\(100 %\\) ✅ · \\+${n + 5} puntos$`)); ok('ejercicios bien: "ha practicado" con nota y ✅ → ' + pushes[0].body);

// 3) Ejercicios: flojo
pushes.length = 0;
await visit(`${tablas}/practice/tablas`);
n = 0; while (q('.question__prompt')) { await answer(false); n++; }
await sleep(80);
assert.equal(pushes.length, 1); assert.equal(pushes[0].title, 'Alex necesita refuerzo'); assert.match(pushes[0].body, new RegExp(`0 de ${n} \\(0 %\\) ⚠️ · −${n + 5} puntos$`)); ok('ejercicios flojos: "necesita refuerzo" con nota y ⚠️ → ' + pushes[0].title);

// 4) Ejercicios: justo en el 75 % no es flojo
const { practiceMessage, retoMessage } = await import('../js/features/push/parent-alerts/parent-messages.js');
const mk = (c, t) => Array.from({ length: t }, (_, i) => ({ correct: i < c }));
assert.equal(practiceMessage({ name: 'Alex', topicTitle: 'X', subjectName: 'Mates', results: mk(6, 8) }).body, 'Mates · X · 6 de 8 (75 %) ✅ · +9 puntos');
assert.equal(practiceMessage({ name: 'Alex', topicTitle: 'X', subjectName: 'Mates', results: mk(5, 8) }).title, 'Alex necesita refuerzo');
assert.deepEqual(retoMessage({ name: 'Alex', answers: mk(8, 10) }), { title: 'Alex ha hecho el reto', body: '8 de 10 (80 %) ✅ · +11 puntos' });
assert.deepEqual(retoMessage({ name: 'Alex', answers: mk(5, 10) }), { title: 'Alex ha hecho el reto', body: '5 de 10 (50 %) ⚠️ Necesita refuerzo · 0 puntos' });
assert.ok(practiceMessage({ name: 'Alex', topicTitle: 'T'.repeat(300), subjectName: 'M', results: mk(1, 1) }).body.length < 120); ok('el 75 % justo cuenta como bien (regla de refuerzo), por debajo avisa; textos del reto y títulos largos recortados');

// 5) Si el aviso falla, la app sigue igual
pushes.length = 0; pushFails = true; warns.length = 0;
await visit(`${tablas}/practice/tablas`);
while (q('.question__prompt')) await answer(true);
await sleep(80); assert.ok(q('.result__score')); assert.match(q('[role=status]').textContent, /guardad/i); assert.ok(warns.some((w) => /avisar a los padres/.test(w))); assert.equal(errors.filter((e) => !/Experimental/.test(e)).length, 0); pushFails = false; ok('si el aviso falla: el resultado se guarda igual y solo queda un aviso en consola');

// 6) Reto
for (const [s, t] of TOPICS) db.sqlite.prepare(`INSERT OR IGNORE INTO study_progress (id, profile_id, course_id, subject_id, topic_id, completed_at) VALUES (?, 'alex', '4-primaria', ?, ?, '2026-10-20T10:00:00Z')`).run('st' + s, s, t);
pushes.length = 0;
await visit('#/p/alex/c/4-primaria/reto');
for (let i = 0; i < 10; i++) await answer(i < 7);
await sleep(150); await settle(); assert.ok(q('.result__score'));
assert.equal(pushes.length, 1); assert.deepEqual({ t: pushes[0].title, b: pushes[0].body }, { t: 'Alex ha hecho el reto', b: '7 de 10 (70 %) ⚠️ Necesita refuerzo · +9 puntos' }); ok('reto 7/10: un solo aviso con la nota global y ⚠️ por estar bajo el 75 %');
await visit('#/p/alex/c/4-primaria/reto'); await sleep(50); assert.equal(pushes.length, 1); ok('volver a entrar al reto terminado no repite el aviso');

// 7) Zona de padres: campanita
const { unlock } = await import('../js/features/parents/pin/unlock-state.js'); unlock();
await visit('#/parents');
assert.equal(qa('.switch-row').length, 1); assert.match(q('.switch-row__title').textContent, /Avisos para padres/); assert.ok(q('.switch-row .switch')); ok('zona de padres: aparece la campanita "Avisos para padres"');
assert.equal(errors.filter((e) => !/Experimental/.test(e)).length, 0, errors.join('\n')); ok('sin errores');
console.log('\n' + steps + ' comprobaciones OK'); process.exit(0);
