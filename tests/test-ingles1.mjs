import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>');
Object.assign(globalThis, { window: dom.window, document: dom.window.document, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } });
const R = new URL('../js', import.meta.url).pathname;
const { questionTypes: K } = await import(`${R}/exercises/kinds/index.js`);
const { buildSession } = await import(`${R}/exercises/session.js`);
const { questionView } = await import(`${R}/features/practice/question-view.js`);
const { loadTopic, loadTopics } = await import(`${R}/content/registry.js`);
const { texts } = await import(`${R}/shared/i18n.js`);
const { renderBlocks } = await import(`${R}/features/study/lesson-blocks.js`);

const topics = await loadTopics('1-primaria', 'ingles');
assert.equal(topics.length, 16); assert.ok(topics.every((t) => t.available)); console.log('✓ 1.º de Inglés tiene 16 temas con contenido');
assert.equal(new Set(topics.map((t) => t.id)).size, 16);

const right = { choice: () => 0, order: (q) => q.answer, text: (q) => q.answers[0], words: (q) => q.answer };
const t = texts('en');
const wrongSimple = (q) => (q.type === 'choice' ? 1 : null);

for (const meta of topics) {
  const { study, exercises } = await loadTopic('1-primaria', 'ingles', meta.id);
  assert.ok(study.length > 2, meta.id); assert.ok(renderBlocks(study, { speak: true }).length, meta.id);
  assert.ok(exercises.length >= 5, `${meta.id}: pocos ejercicios`);
  const ids = new Set();
  for (const e of exercises) { assert.ok(e.id && !ids.has(e.id), `${meta.id}: id repetido ${e.id}`); ids.add(e.id); }
  const seen = new Set();
  for (let round = 0; round < 60; round++) {
    for (const e of exercises) {
      const q = e.generate ? e.generate() : e;
      const where = `${meta.id}/${e.id}: ${q.prompt}`;
      assert.ok(q.prompt && q.explain, where);
      assert.ok(typeof q.explain === 'string' && q.explain.length > 1, where);
      if (q.type === 'choice') {
        assert.equal(new Set(q.options).size, q.options.length, `opciones repetidas · ${where} · ${q.options}`);
        assert.ok(q.options.length >= 2 && q.options.every((o) => typeof o === 'string' && o.length), where);
        assert.ok(K.choice.check(q, 0), where);
        for (let i = 1; i < q.options.length; i++) assert.ok(!K.choice.check(q, i), `opción ${i} también correcta · ${where}`);
      }
      if (q.type === 'text') { assert.ok(q.answers.length && q.answers.every((a) => a && !/undefined|NaN|\[object/.test(a)), where); }
      if (q.type === 'words') assert.ok(q.answer.every((w) => w && !/undefined|NaN/.test(w)) && !(q.extra || []).some((x) => q.answer.includes(x)), `ficha extra repetida · ${where}`);
      assert.ok(!/undefined|NaN|\[object/.test(JSON.stringify(q)), where);
      assert.ok(K[q.type].check(q, right[q.type](q)), where);
      seen.add(q.prompt);
    }
  }
  const generated = exercises.filter((e) => e.generate).length;
  assert.ok(seen.size >= exercises.length * 3 || generated === 0, `${meta.id}: poca variedad (${seen.size})`);
  for (let i = 0; i < 10; i++) for (const q of buildSession(exercises, 8)) assert.ok(questionView({ q, index: 0, total: 1, t, onChecked() {}, onContinue() {} }).nodes.length, meta.id);
  console.log(`✓ ${meta.id}: ${exercises.length} ejercicios, ${seen.size} preguntas distintas`);
}
