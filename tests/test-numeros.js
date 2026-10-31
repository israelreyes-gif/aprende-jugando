import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>');
Object.assign(globalThis, { window: dom.window, document: dom.window.document });
const { questionTypes: K } = await import('../js/exercises/kinds/index.js');
const { fmt } = await import('../js/shared/number-format.js');
const { buildSession } = await import('../js/exercises/session.js');
const { questionView } = await import('../js/features/practice/question-view.js');
const { loadTopic } = await import('../js/content/registry.js');
const { exercises, study } = (await loadTopic('4-primaria', 'mates', 'numeros'));
assert.equal(exercises.length, 6); assert.ok(study.length > 0);
const { texts } = await import('../js/shared/i18n.js'); const t = texts('es');
const correct = { number: (q) => q.answer, choice: () => 0, words: (q) => q.answer, order: (q) => q.answer };
const types = new Set();
for (let i = 0; i < 300; i++) for (const q of buildSession(exercises, 6)) {
  types.add(q.type); assert.ok(q.id && q.prompt && q.explain);
  assert.ok(K[q.type].check(q, correct[q.type](q)), q.prompt);
  if (q.type === 'choice') assert.equal(new Set(q.options).size, q.options.length);
  if (q.type === 'order') assert.equal(new Set(q.answer).size, q.answer.length);
  if (q.type === 'number') { assert.ok(Number.isInteger(q.answer) && q.answer > 0); const { toNum } = await import('../js/shared/answer-parse.js'); assert.ok(K.number.check(q, toNum(q.thousands ? fmt(q.answer) : String(q.answer)))); }
  if (i < 20) { const v = questionView({ q, index: 0, total: 1, t, onChecked() {}, onContinue() {} }); assert.ok(v.nodes.length); if (q.visual) assert.ok(v.nodes[1].querySelector('.digit-card')); }
}
assert.deepEqual([...types].sort(), ['choice', 'number', 'order', 'words']);
console.log('numeros OK');
