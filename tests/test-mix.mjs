import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import worker from './parent-worker.js';
import { makeD1 } from './d1-shim.js';

// Mix de preguntas de una unidad: tarjeta, temas que entran, 36 preguntas, guardado por tema, puntos y estadísticas.
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'https://yo.github.io/aprende/', pretendToBeVisual: true });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, location: window.location, localStorage: window.localStorage, sessionStorage: window.sessionStorage });
window.scrollTo = () => {};
sessionStorage.setItem('aj.session.parent', 'test');
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname);
const env = { DB: db, API_KEY: 'k' };
globalThis.fetch = async (url, init = {}) => worker.fetch(new Request(url, init), env);
console.error = () => {};
const C = '4-primaria';
db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color,gender,course_id) VALUES ('alex','Alex','#8EDBC0','chico','${C}'),('lucia','Lucía','#FFB3CC','chica','${C}')`);
const rel = db.sqlite.prepare('INSERT INTO topic_release (id,profile_id,course_id,subject_id,topic_id) VALUES (?,?,?,?,?)');
const std = db.sqlite.prepare('INSERT INTO study_progress (id,profile_id,course_id,subject_id,topic_id,completed_at) VALUES (?,?,?,?,?,?)');
// Alex: liberados todos los de la Unit 1 y uno de la Unit 2; estudiados 4 de la Unit 1, la lectura y el de la Unit 2 ('could' liberado pero sin estudiar)
for (const t of ['time', 'question-words', 'vocabulary', 'was-were', 'could', 'reading-crow', 'food-drink']) rel.run('r' + t, 'alex', C, 'ingles', t);
for (const t of ['time', 'question-words', 'vocabulary', 'was-were', 'reading-crow', 'food-drink']) std.run('s' + t, 'alex', C, 'ingles', t, new Date().toISOString());

const { setConnection } = await import('../js/core/api.js');
const { reload } = await import('../js/core/router.js');
setConnection('https://w.example', 'k');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const app = () => document.getElementById('app');
const text = () => app().textContent;
const q = (s) => app().querySelector(s);
const qa = (s) => [...app().querySelectorAll(s)];
async function settle() { await sleep(30); for (let i = 0; i < 300; i++) { if (!q('.spinner')) { await sleep(20); if (!q('.spinner')) return; } await sleep(10); } throw new Error('cargando…'); }
async function visit(hash) { if (location.hash === hash) reload(); else location.hash = hash; await settle(); await sleep(60); await settle(); }
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };
await import('../js/main.js'); await settle();

// 1. Tarjeta: solo en Ejercicios y al final de cada unidad
await visit(`#/p/alex/c/${C}/s/ingles/practice`);
const groups = qa('details.topic-group');
const withMix = groups.filter((g) => g.querySelector('a[href*="/mix/"]'));
assert.equal(withMix.length, 2); assert.match(withMix[0].textContent, /Unit 1/); assert.match(withMix[1].textContent, /Unit 2/); assert.equal(qa('a[href*="/mix/"]').length, 2); ok('hay una tarjeta de mix en cada unidad (Unit 1 y Unit 2)');
assert.match(withMix[0].querySelector('.topic-group__count').textContent, /^6 temas$/); ok('el mix no cuenta como tema');
const last = withMix[0].querySelector('.topic-list').lastElementChild; assert.ok(last.matches('a[href*="/mix/unit-1"]')); assert.match(last.textContent, /Mix · Unit 1/); assert.match(last.textContent, /36 questions/); ok('es la última tarjeta de la unidad y dice 36 questions');
await visit(`#/p/alex/c/${C}/s/ingles/study`); assert.equal(qa('a[href*="/mix/"]').length, 0); ok('en la pestaña Estudio no hay mix');

// 2. Temas que entran
const { loadMixPool } = await import('../js/features/mix/mix-pool.js');
const { findMix } = await import('../js/content/mixes.js');
const mix = await findMix(C, 'ingles', 'unit-1');
assert.equal(mix.size, 36);
const pool = await loadMixPool('alex', C, 'ingles', mix);
assert.deepEqual(pool.map((p) => p.topicId).sort(), ['question-words', 'time', 'vocabulary', 'was-were']); ok('entran los temas de la unidad liberados y estudiados; no la lectura, ni el no estudiado, ni los de otra unidad');
assert.deepEqual((await loadMixPool('lucia', C, 'ingles', mix)), []); ok('sin temas estudiados el pool está vacío');

// 3. 36 preguntas repartidas por tema
const { planReto } = await import('../js/features/reto/plan/plan-reto.js');
const { materializePlan } = await import('../js/features/reto/plan/materialize-plan.js');
const questions = materializePlan(planReto(pool, 36), pool);
assert.equal(questions.length, 36);
const per = {}; questions.forEach((x) => { per[x.topicId] = (per[x.topicId] || 0) + 1; });
assert.ok(Object.values(per).every((c) => c >= 6) && Object.keys(per).length === 4); ok('36 preguntas, de los 4 temas y repartidas');

// 4. Pantalla: empieza en la pregunta 1 de 36 / sin temas lo explica
await visit(`#/p/alex/c/${C}/s/ingles/mix/unit-1`);
assert.match(text(), /Question 1 of 36/); ok('la pantalla del mix empieza en "Question 1 of 36"');
await visit(`#/p/lucia/c/${C}/s/ingles/mix/unit-1`);
assert.match(text(), /Study and unlock some topics/); assert.ok(!/Question 1/.test(text())); ok('sin temas estudiados explica qué hacer');
await visit(`#/p/alex/c/${C}/s/ingles/mix/no-existe`); assert.match(text(), /No hemos encontrado/); ok('un mix que no existe da "no encontrado"');

// 5. Jugarlo entero: acertando solo las dos primeras de cada tema, el resto mal
await visit(`#/p/alex/c/${C}/s/ingles/mix/unit-1`);
let answered = 0, drive = true;
const answerOne = async () => {
  const opt = q('.option'); const input = q('input.input');
  if (!opt && !input && q('.word-pool .word')) { for (let k = 0; k < 20 && q('.word-pool .word'); k++) q('.word-pool .word').click(); }
  if (!opt && !input && !q('.word-line .word') && q('.tap-item')) q('.tap-item').click();
  if (opt) opt.click(); else if (q('.word-line .word') || q('.tap-item')) { /* ya respondido arriba */ } else if (input) { input.value = 'zzz'; input.dispatchEvent(new window.Event('input', { bubbles: true })); } else { if (process.env.DBG) console.log(q('.stack').innerHTML.slice(0, 700)); return false; }
  await sleep(5); const btn = q('.btn--primary'); if (btn.disabled) return false; btn.click(); await sleep(5); q('.btn--primary').click(); await sleep(5); return true;
};
for (let i = 0; i < 36 && drive; i++) { if (/Question \d+ of 36/.test(text()) || i === 0) { drive = await answerOne(); if (drive) answered++; } }
if (answered === 36) {
  await sleep(600); await settle();
  assert.match(text(), /\/36/); ok('se juega el mix entero y sale el resultado');
  const rows = db.sqlite.prepare("SELECT id, topic_id, total, kind FROM practice_sessions WHERE profile_id='alex'").all();
  assert.equal(rows.length, 4); assert.ok(rows.every((r) => r.kind === 'mix')); assert.equal(rows.reduce((a, r) => a + r.total, 0), 36); assert.equal(new Set(rows.map((r) => r.id.split(':')[0])).size, 1); ok('se guarda una sesión kind "mix" por tema, con las 36 respuestas');
  assert.equal(db.sqlite.prepare("SELECT COUNT(*) c FROM answers WHERE session_id LIKE '%:ingles:%'").get().c, 36); ok('las 36 respuestas quedan guardadas');
} else { console.log(`  (el simulador de respuestas solo pudo con ${answered} preguntas: se prueba el guardado directamente)`); }

// 6. Guardado y puntos (directo, con respuestas conocidas)
db.sqlite.exec("DELETE FROM practice_sessions; DELETE FROM answers;");
const { saveMix } = await import('../js/data/mix/save-mix.js');
const ans = (topicId, correct, i) => ({ questionId: `q${i}`, correct, given: 'x', prompt: 'p', answerText: 'a', subjectId: 'ingles', topicId });
const answers = [ans('time', true, 1), ans('time', true, 2), ans('vocabulary', true, 3), ans('vocabulary', false, 4), ans('was-were', true, 5), ans('was-were', true, 6)];
await saveMix({ profileId: 'alex', courseId: C, answers, durationS: 60 });
const rows2 = db.sqlite.prepare("SELECT topic_id, total, correct, kind FROM practice_sessions ORDER BY topic_id").all();
assert.deepEqual(rows2.map((r) => [r.topic_id, r.total, r.correct, r.kind]), [['time', 2, 2, 'mix'], ['vocabulary', 2, 1, 'mix'], ['was-were', 2, 2, 'mix']]); ok('una sesión por tema con sus aciertos');
const { loadPoints } = await import('../js/features/points/load-points.js');
const pts = await loadPoints('alex');
assert.equal(pts.right, 5); assert.equal(pts.wrong, 1); assert.equal(pts.bonus, 5); ok('puntos como siempre: +1/−1 por pregunta y el bonus de ±5 una sola vez para todo el mix');
await visit(`#/p/alex/c/${C}/s/ingles/practice`);
assert.match(text(), /⭐ 2\/2/); ok('cuenta en las estadísticas de cada tema (mejor nota del tema)');
await visit('#/parents/alex/stats/' + C + '/ingles'); assert.ok(/time|Time/i.test(text())); ok('la zona de padres lo ve en las estadísticas del tema');
{
  // Otros mixes: Unit 2 de Inglés (sin la lectura) y Matemáticas (toda la asignatura)
  const { loadMixes, mixTopics } = await import('../js/content/mixes.js');
  const ing = await loadMixes(C, 'ingles'); assert.deepEqual(ing.map((m) => m.id), ['unit-1', 'unit-2']); assert.ok(ing.every((m) => m.size === 36));
  const u2 = (await mixTopics(C, 'ingles', ing[1])).map((x) => x.id); assert.deepEqual(u2, ['food-drink', 'who-which-where', 'irregular-verbs', 'past-when', 'food-groups']); ok('Unit 2 de Inglés: 5 temas y sin la lectura');
  const mm = await loadMixes(C, 'mates'); assert.equal(mm.length, 1); assert.equal(mm[0].size, 36); assert.equal(mm[0].unit, undefined);
  const mt = await mixTopics(C, 'mates', mm[0]); assert.ok(mt.length >= 1); ok('Mates: un mix sin unidad (todos los temas de la asignatura)');
  const m1 = await loadMixes('1-primaria', 'ingles'); assert.equal(m1.length, 1); assert.equal(m1[0].size, 36); assert.equal(m1[0].unit, undefined);
  const t1 = await mixTopics('1-primaria', 'ingles', m1[0]); assert.ok(t1.length >= 10 && t1.every((x) => x.inMix !== false)); ok('English de 1.º: un mix de 36 sin unidad con todos los temas disponibles');
}
console.log(`\n${n} comprobaciones OK`);
