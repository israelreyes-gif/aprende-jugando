// Sociales 4º: cada tema carga, tiene lección y preguntas válidas (ids únicos, opciones distintas, respuesta que se corrige bien).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage });
const { questionTypes: K } = await import('../js/exercises/kinds/index.js');
const { buildSession } = await import('../js/exercises/session.js');
// Contenido real del repo (run-all deja en su copia temporal temas de prueba en Sociales).
const real = process.env.REAL_REPO ? `file://${process.env.REAL_REPO}` : new URL('../', import.meta.url).href.replace(/\/$/, '');
const dir = new URL(`${real}/js/content/4-primaria/sociales/`);
const { topics, mixes } = await import(`${dir.href}index.js`);
assert.deepEqual(mixes.map((m) => [m.id, m.size]), [['sociales', 36]], 'Sociales declara su mix de 36 preguntas');
const loadTopic = async (_c, _s, id) => import(`${dir.href}${id}/index.js`);
const folders = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
assert.deepEqual(topics.map((t) => t.id).sort(), folders.sort(), 'cada carpeta de Sociales está en index.js y al revés');
for (const { id } of topics) {
  const { study, exercises } = await loadTopic('4-primaria', 'sociales', id);
  assert.ok(study.length > 3 && exercises.length >= 20, `${id}: lección y al menos 20 preguntas`);
  const ids = exercises.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length, `${id}: ids repetidos`);
  const prompts = exercises.map((q) => q.prompt);
  assert.equal(new Set(prompts).size, prompts.length, `${id}: preguntas repetidas`);
  for (const q of exercises) {
    assert.ok(q.prompt && q.explain, `${id}/${q.id}`);
    if (q.type === 'choice') { assert.equal(new Set(q.options).size, q.options.length, q.prompt); assert.ok(K.choice.check(q, 0), q.prompt); }
    if (q.type === 'order') { assert.equal(new Set(q.answer).size, q.answer.length); assert.ok(K.order.check(q, q.answer)); }
    if (q.type === 'text') assert.ok(K.text.check(q, q.answers[0]), q.prompt);
  }
  assert.ok(buildSession(exercises, 8).length > 0);
  console.log(`  ✓ ${id}: ${exercises.length} preguntas`);
}
