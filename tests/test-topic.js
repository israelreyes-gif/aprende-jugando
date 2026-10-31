// uso: node test-topic.js [tema] [n tandas]  (sin tema, prueba todos los de Matemáticas)
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>');
Object.assign(globalThis, { window: dom.window, document: dom.window.document });
const { questionTypes: K } = await import('../js/exercises/kinds/index.js');
const { buildSession } = await import('../js/exercises/session.js');
const { questionView } = await import('../js/features/practice/question-view.js');
const { loadTopic } = await import('../js/content/registry.js');
const { fmt } = await import('../js/shared/number-format.js');
const { toNum } = await import('../js/shared/answer-parse.js');
const { texts } = await import('../js/shared/i18n.js');
const t = texts('es');
import fs from 'node:fs';
const matesDir = new URL('../js/content/4-primaria/mates/', import.meta.url);
const topicIds = process.argv[2] ? [process.argv[2]] : fs.readdirSync(matesDir, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'lib' && fs.existsSync(new URL(`${d.name}/index.js`, matesDir))).map((d) => d.name);
for (const topicId of topicIds) {
const loaded = await loadTopic('4-primaria', 'mates', topicId);
assert.ok(loaded, 'tema no encontrado'); const { exercises, study } = loaded; assert.ok(study.length);
const right = { number: (q) => q.answer, choice: () => 0, words: (q) => q.answer, order: (q) => q.answer, text: (q) => q.answers[0], multi: (q) => q.fields.map((f) => f.answer), rule: (q) => q.example.__v, tap: (q) => q.items.map((it, i) => (it.correct ? i : -1)).filter((i) => i >= 0) };
const seen = new Set(); const ids = new Set();
for (let i = 0; i < +(process.argv[3] || 40); i++) for (const q of buildSession(exercises, 8)) {
  seen.add(q.type); ids.add(q.id); assert.ok(q.id && q.prompt && q.explain, JSON.stringify(q).slice(0, 200));
  if (q.type === 'choice') assert.equal(new Set(q.options).size, q.options.length, q.prompt);
  if (q.type === 'order') assert.equal(new Set(q.answer).size, q.answer.length);
  if (q.type === 'rule') { assert.equal(q.test(q.example.match(/\d+/g).slice(0, q.fields.length).map(Number)), true, q.example); }
  else if (q.type === 'number') { assert.ok(K.number.check(q, toNum(q.thousands ? fmt(q.answer) : String(q.answer))), q.prompt); }
  else if (q.type === 'tap') { assert.ok(q.items.some((it) => it.correct)); }
  else assert.ok(K[q.type].check(q, right[q.type](q)), q.prompt);
  if (i < 15) { const v = questionView({ q, index: 0, total: 1, t, onChecked() {}, onContinue() {} }); assert.ok(v.nodes.length); }
}
console.log(topicId, 'OK · tipos:', [...seen].join(','), '· ids:', [...ids].length);
}
