import assert from 'node:assert/strict';
const R = new URL('../js', import.meta.url).pathname;
const { withSeed } = await import(`${R}/core/seeded.js`);
const { planReto } = await import(`${R}/features/reto/plan/plan-reto.js`);
const { materializePlan } = await import(`${R}/features/reto/plan/materialize-plan.js`);
const { loadTopics } = await import(`${R}/content/registry.js`);
const { buildSession } = await import(`${R}/exercises/session.js`);
const { questionTypes: K } = await (async () => { const { JSDOM } = await import('jsdom'); const dom = new JSDOM('<!doctype html><body></body>'); Object.assign(globalThis, { window: dom.window, document: dom.window.document }); return import(`${R}/exercises/kinds/index.js`); })();
let ok = 0; const t = (name, fn) => { try { fn(); ok++; console.log('✓', name); } catch (e) { console.log('✗', name, '\n   ', e.message.split('\n')[0]); process.exitCode = 1; } };

const meta = await loadTopics('4-primaria', 'mates');
const mates = []; for (const topic of meta.filter((x) => x.available)) mates.push({ subjectId: 'mates', topicId: topic.id, exercises: (await topic.load()).exercises });
console.log('temas de mates con contenido:', mates.length);
const gen = (n) => ({ id: n, generate: () => ({ type: 'number', prompt: 'p' + n, answer: 1, explain: 'e' }) });
const synth = (subjectId, topicId) => ({ subjectId, topicId, exercises: [gen('g1'), gen('g2')] });
const count = (plan, key) => plan.reduce((m, p) => ((m[p[key]] = (m[p[key]] || 0) + 1), m), {});

t('withSeed: misma semilla, misma secuencia', () => { const a = withSeed(7, () => [Math.random(), Math.random()]); const b = withSeed(7, () => [Math.random(), Math.random()]); assert.deepEqual(a, b); });
t('withSeed: semillas distintas, secuencias distintas', () => assert.notDeepEqual(withSeed(7, () => Math.random()), withSeed(8, () => Math.random())));
t('withSeed restaura Math.random (también si falla)', () => { const o = Math.random; withSeed(1, () => 1); assert.equal(Math.random, o); try { withSeed(1, () => { throw new Error('x'); }); } catch {} assert.equal(Math.random, o); });

t('13 temas → 10 preguntas de 10 temas distintos', () => { for (let i = 0; i < 200; i++) { const p = planReto(mates); assert.equal(p.length, 10); assert.equal(new Set(p.map((x) => x.topicId)).size, 10); } });
t('13 temas: reparto equilibrado en 3000 retos', () => { const total = {}; for (let i = 0; i < 3000; i++) for (const p of planReto(mates)) total[p.topicId] = (total[p.topicId] || 0) + 1; const v = Object.values(total); assert.equal(v.length, 13); const exp = 3000 * 10 / 13; assert.ok(Math.min(...v) > exp * 0.9 && Math.max(...v) < exp * 1.1, JSON.stringify(total)); });
t('3 temas → 4/3/3', () => { const c = Object.values(count(planReto([synth('a', 'x'), synth('b', 'y'), synth('c', 'z')]), 'topicId')).sort(); assert.deepEqual(c, [3, 3, 4]); });
t('3 temas: el que recibe la extra cambia al azar', () => { const who = new Set(); for (let i = 0; i < 100; i++) { const c = count(planReto([synth('a', 'x'), synth('b', 'y'), synth('c', 'z')]), 'topicId'); who.add(Object.keys(c).find((k) => c[k] === 4)); } assert.equal(who.size, 3); });
t('1 tema → 10 preguntas de ese tema', () => assert.equal(planReto([synth('a', 'x')]).length, 10));
t('0 temas → plan vacío', () => assert.deepEqual(planReto([]), []));
t('tema solo con 2 preguntas fijas no se repite y el resto sale de otro', () => { const fixed = { subjectId: 'a', topicId: 'fx', exercises: [{ id: 'f1', type: 'number', prompt: 'a', answer: 1, explain: 'e' }, { id: 'f2', type: 'number', prompt: 'b', answer: 2, explain: 'e' }] }; for (let i = 0; i < 100; i++) { const p = planReto([fixed, synth('b', 'g')]); assert.equal(p.length, 10); const f = p.filter((x) => x.topicId === 'fx'); assert.ok(f.length <= 2 && new Set(f.map((x) => x.exerciseId)).size === f.length); } });
t('solo preguntas fijas insuficientes → plan más corto, sin fallar', () => { const fixed = { subjectId: 'a', topicId: 'fx', exercises: [{ id: 'f1', type: 'number', prompt: 'a', answer: 1, explain: 'e' }] }; assert.equal(planReto([fixed]).length, 1); });
t('mezcla de asignaturas: todas aparecen', () => { const topics = [...mates.slice(0, 4), synth('sociales', 's1'), synth('ingles', 'i1'), synth('lengua', 'l1'), synth('sciences', 'c1')]; const seen = new Set(); for (let i = 0; i < 100; i++) for (const p of planReto(topics)) seen.add(p.subjectId); assert.equal(seen.size, 5); });
t('el plan es JSON simple (cabe en la base de datos)', () => { const p = planReto(mates); assert.deepEqual(JSON.parse(JSON.stringify(p)), p); assert.ok(JSON.stringify(p).length < 1500); });

t('materializar: mismo plan → mismas preguntas (300 retos, todos los temas)', () => { for (let i = 0; i < 300; i++) { const p = planReto(mates); const a = materializePlan(p, mates), b = materializePlan(p, mates); assert.equal(a.length, 10); assert.equal(JSON.stringify(a), JSON.stringify(b)); a.forEach((q, j) => { if (q.type === 'rule') assert.equal(q.example, b[j].example); }); } });
t('materializar: preguntas completas y con tema', () => { for (let i = 0; i < 300; i++) for (const q of materializePlan(planReto(mates), mates)) { assert.ok(q.id && q.prompt && q.explain && q.subjectId === 'mates' && q.topicId, JSON.stringify(q).slice(0, 150)); assert.ok(K[q.type], q.type); } });
t('materializar: preguntas de rule siguen con su función test', () => { let seen = 0; for (let i = 0; i < 500; i++) for (const q of materializePlan(planReto(mates), mates)) if (q.type === 'rule') { seen++; assert.equal(typeof q.test, 'function'); } assert.ok(seen > 0, 'no salió ninguna rule'); });
t('materializar: ejercicio desaparecido se salta', () => { const p = planReto(mates); const q = materializePlan([...p, { subjectId: 'mates', topicId: p[0].topicId, exerciseId: 'no-existe', seed: 1 }], mates); assert.equal(q.length, 10); });
t('materializar: no cambia Math.random', () => { const o = Math.random; materializePlan(planReto(mates), mates); assert.equal(Math.random, o); });
t('buildSession sigue igual (8 preguntas por tema)', () => { for (const topic of mates) assert.equal(buildSession(topic.exercises, 8).length >= 8, true); });
console.log(`\n${ok} ✓`);
