import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>');
Object.assign(globalThis, { window: dom.window, document: dom.window.document });
const R = new URL('../js', import.meta.url).pathname;
const { questionTypes: K } = await import(`${R}/exercises/kinds/index.js`);
const { buildSession } = await import(`${R}/exercises/session.js`);
const { questionView } = await import(`${R}/features/practice/question-view.js`);
const { loadTopic, loadTopics } = await import(`${R}/content/registry.js`);
const { texts } = await import(`${R}/shared/i18n.js`);
const { renderBlocks } = await import(`${R}/features/study/lesson-blocks.js`);

const topics = await loadTopics('4-primaria', 'ingles');
const meta = topics.find((t) => t.id === 'reading-crow');
assert.ok(meta && meta.available && meta.unit.startsWith('Unit 1')); console.log('✓ Reading: The Crow and the Pitcher está en la Unit 1 y tiene contenido');
assert.ok(!topics.some((t) => t.id === 'reading-diversicus')); console.log('✓ ya no queda "Reading: Diversicus"');

const { study, exercises } = await loadTopic('4-primaria', 'ingles', 'reading-crow');
assert.equal(study.filter((b) => b.p).length, 6); assert.ok(study.some((b) => b.fold)); console.log('✓ lección: 6 párrafos + palabras plegables');
assert.ok(renderBlocks(study, { speak: true }).length); console.log('✓ la lección se dibuja con 🔊');

const right = { choice: () => 0, order: (q) => q.answer, text: (q) => q.answers[0], words: (q) => q.answer };
const ids = new Set();
for (const q of exercises) {
  assert.ok(q.id && q.prompt && q.explain, q.id); assert.ok(!ids.has(q.id), 'id repetido ' + q.id); ids.add(q.id);
  if (q.type === 'choice') assert.equal(new Set(q.options).size, q.options.length, q.prompt);
  assert.ok(K[q.type].check(q, right[q.type](q)), q.prompt);
}
console.log('✓ ' + exercises.length + ' preguntas válidas y con respuesta correcta');
const t = texts('en');
for (let i = 0; i < 20; i++) for (const q of buildSession(exercises, 8)) { assert.ok(questionView({ q, index: 0, total: 1, t, onChecked() {}, onContinue() {} }).nodes.length); }
console.log('✓ las sesiones se dibujan');
