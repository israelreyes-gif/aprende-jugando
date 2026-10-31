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

const tablas = '#/p/alex/c/4-primaria/s/mates';
const closeCelebration = async () => { document.querySelector('.celebration__button').click(); await sleep(20); };
const celebration = () => document.querySelector('.celebration');

// 1) Inicio: nivel 1 con 0 puntos
await visit('#/p/alex');
assert.ok(q('a.level-card')); assert.match(q('.level-card').textContent, /NIVEL 1Explorador0 puntos50 puntos más para ser Aprendiz 📘/); assert.equal(q('a.level-card').getAttribute('href'), '#/p/alex/levels'); ok('inicio del perfil: tarjeta "Nivel 1 · Explorador · 0 puntos · 50 más para Aprendiz"');
await visit('#/p/alex/c/4-primaria'); assert.ok(q('.level-card')); assert.ok(q('.level-card').compareDocumentPosition(q('.reto-card')) & 4, 'la tarjeta de nivel va antes del reto'); ok('pantalla de asignaturas: la tarjeta de nivel va encima del reto');

// 2) Estudiar: +10 a pantalla completa
await visit(`${tablas}/study/tablas`);
q('.lesson__actions button').click(); await sleep(120);
assert.ok(celebration()); const c1 = celebration().textContent; assert.match(c1, /\+10/); assert.match(c1, /tema estudiado/); assert.match(c1, /Tablas de multiplicar\+10/); assert.match(c1, /Total ahora10 puntos/); assert.ok(celebration().querySelector('img[src^="icons/mochila"]')); ok('marcar estudiado: pantalla "+10 ¡tema estudiado!" con la mochila, el tema y "Total ahora 10 puntos"');
assert.equal(document.querySelector('.modal'), null); await closeCelebration(); assert.equal(celebration(), null); ok('se cierra con el botón y no sale además la ventana antigua');

// 3) Ejercicios perfectos: +13 y SUBE DE NIVEL (40 + 13 = 53 ≥ 50)
for (const [s, t, id] of [['sociales', 'relieve', 'a'], ['ingles', 'verb-to-be', 'b'], ['lengua', 'sustantivo', 'c']]) db.sqlite.prepare(`INSERT INTO study_progress (id, profile_id, course_id, subject_id, topic_id, completed_at) VALUES (?, 'alex', '4-primaria', ?, ?, '2026-10-20T10:00:00Z')`).run('sx' + id, s, t);
pushes.length = 0;
await visit(`${tablas}/practice/tablas`);
let n = 0; while (q('.question__prompt')) { await answer(true); n++; }
await sleep(250);
const burst = q('.points-burst'); assert.ok(burst); assert.ok(burst.classList.contains('points-burst--up')); assert.equal(q('.points-burst__number').textContent, `+${n + 5}`); assert.match(burst.textContent, new RegExp(`${n} aciertos\\+${n}`)); assert.match(burst.textContent, /0 fallos0/); assert.match(burst.textContent, /⭐ Bonus\+5/); assert.match(burst.textContent, new RegExp(`Total ahora${40 + n + 5} puntos`)); ok(`ejercicios perfectos: "+${n + 5}" = ${n} aciertos + bonus 5; total ${40 + n + 5}`);
assert.ok(q('.result__score')); assert.ok(q('.points-burst').compareDocumentPosition(q('.result__score')) & 2, 'los puntos van después de la nota'); ok('los puntos aparecen justo debajo de la nota (X/Y)');
assert.ok(celebration()); assert.ok(celebration().classList.contains('celebration--level')); assert.match(celebration().textContent, /¡NUEVO NIVEL!/); assert.match(celebration().textContent, /Nivel 2/); assert.match(celebration().textContent, /Aprendiz/); assert.match(celebration().textContent, /50 puntos/); ok('al cruzar los 50 puntos sale "¡NUEVO NIVEL! Nivel 2 · Aprendiz"');
assert.deepEqual(pushes.map((p) => p.title), ['Alex ha practicado', '¡Alex ha subido a Aprendiz!']); assert.equal(pushes[1].body, 'Nivel 2 · 50 puntos 📘'); ok('a los padres les llegan dos avisos: el de la práctica y el de subida de nivel');
await closeCelebration();

// 4) Ejercicios muy flojos: negativo, sin celebración y baja el total
pushes.length = 0;
await visit(`${tablas}/practice/tablas`);
n = 0; while (q('.question__prompt')) { await answer(false); n++; }
await sleep(250);
assert.ok(q('.points-burst').classList.contains('points-burst--down')); assert.equal(q('.points-burst__number').textContent, `−${n + 5}`); assert.match(q('.points-burst').textContent, /puntos esta vez/); assert.match(q('.points-burst').textContent, /⭐ Bonus−5/); assert.match(q('.points-burst').textContent, new RegExp(`Total ahora${40} puntos`)); assert.equal(celebration(), null); ok(`ejercicios flojos: "−${n + 5}" (fallos + bonus −5), mensaje animador, total ${40} y sin celebración`);
assert.match(pushes[0].body, new RegExp(`−${n + 5} puntos$`)); assert.equal(pushes.length, 1); ok('el aviso a los padres lleva los puntos negativos y no hay aviso de nivel');

// 5) Reto: puntos del reto completo con un solo bonus
for (const [s, t] of TOPICS) db.sqlite.prepare(`INSERT OR IGNORE INTO study_progress (id, profile_id, course_id, subject_id, topic_id, completed_at) VALUES (?, 'alex', '4-primaria', ?, ?, '2026-10-20T10:00:00Z')`).run('st' + s, s, t);
for (const [s, t] of TOPICS) db.sqlite.prepare(`INSERT OR IGNORE INTO topic_release (id, profile_id, course_id, subject_id, topic_id) VALUES (?, 'alex', '4-primaria', ?, ?)`).run('rr' + s, s, t);
const before = (await (await import('../js/features/points/load-points.js')).loadPoints('alex')).total;
pushes.length = 0;
await visit('#/p/alex/c/4-primaria/reto');
for (let i = 0; i < 10; i++) await answer(i < 8);
await sleep(300); await settle(); await sleep(100);
assert.ok(q('.result__score')); assert.equal(q('.points-burst__number').textContent, '+11'); assert.match(q('.points-burst').textContent, /8 aciertos\+8/); assert.match(q('.points-burst').textContent, /2 fallos−2/); assert.match(q('.points-burst').textContent, /⭐ Bonus\+5/); assert.match(q('.points-burst').textContent, new RegExp(`Total ahora${before + 11} puntos`)); ok(`reto 8/10: "+11" (8 − 2 + bonus 5, un solo bonus por todo el reto) · total ${before + 11}`);
if (celebration()) await closeCelebration();
assert.match(pushes[0].body, /8 de 10 \(80 %\) ✅ · \+11 puntos/); ok('el aviso del reto a los padres incluye "+11 puntos"');

// 6) Lista de niveles
await visit('#/p/alex/levels');
assert.equal(qa('.level-row').length, 10); assert.deepEqual(qa('.level-row__min').map((e) => e.textContent.replace(' ◀', '')), ['0', '50', '120', '220', '350', '520', '750', '1.050', '1.450', '2.000']);
const cur = qa('.level-row--current'); assert.equal(cur.length, 1); const lvNow = (await import('../js/features/points/levels.js')).levelFor(before + 11); assert.match(cur[0].textContent, new RegExp(`${lvNow.n} · ${lvNow.name}`)); assert.equal(qa('.level-row--done').length, lvNow.n - 1); assert.ok(q('a.icon-btn[href="#/p/alex"]')); ok('pantalla "Mis niveles": 10 filas con sus puntos (1.050, 2.000…), el actual marcado y los anteriores en gris');

// 7) Zona de padres
const { unlock } = await import('../js/features/parents/pin/unlock-state.js'); unlock();
await visit('#/parents');
const row = q('a.row-card'); assert.match(row.querySelector('.row-card__points').textContent, new RegExp(`${before + 11}.*Nivel ${lvNow.n}`)); ok('lista de perfiles: puntos y nivel de Alex a la derecha');
await visit('#/parents/alex');
const sec = q('.level-card'); assert.ok(sec); assert.equal(q('a.level-card'), null); assert.match(qa('.stat-chip').map((c) => c.textContent).join('|'), /\+\d+Hoy/); ok('estadísticas de Alex: tarjeta de nivel (sin enlace) y chips de hoy / semana');
const lines = qa('.points-card .points-line').map((l) => l.textContent); assert.ok(lines.some((l) => /Aciertos/.test(l))); assert.ok(lines.some((l) => /Fallos/.test(l))); assert.ok(lines.some((l) => /Bonus/.test(l))); assert.ok(lines.some((l) => /Temas estudiados \(5\)\+50/.test(l))); assert.match(lines.at(-1), new RegExp(`Total${before + 11}`)); ok('desglose: aciertos, fallos, bonus, temas estudiados (5 → +50) y total');
assert.equal(qa('.points-days__col').length, 7); assert.equal(qa('.points-days__col--today').length, 1); ok('gráfica de los últimos 7 días (hoy resaltado)');
assert.equal(errors.filter((e) => !/Experimental/.test(e)).length, 0, errors.join('\n')); ok('sin errores');
console.log('\n' + steps + ' comprobaciones OK'); process.exit(0);
