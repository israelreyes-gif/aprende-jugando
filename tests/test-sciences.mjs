// Sciences 4º: cada tema carga, tiene lección y preguntas válidas (ids únicos, opciones distintas, respuesta que se corrige bien).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage });
const { questionTypes: K } = await import('../js/exercises/kinds/index.js');
const { buildSession } = await import('../js/exercises/session.js');
// Contenido real del repo (run-all deja en su copia temporal temas de prueba en Sciences).
const real = process.env.REAL_REPO ? `file://${process.env.REAL_REPO}` : new URL('../', import.meta.url).href.replace(/\/$/, '');
const dir = new URL(`${real}/js/content/4-primaria/sciences/`);
const { topics } = await import(`${dir.href}index.js`);
const loadTopic = async (_c, _s, id) => import(`${dir.href}${id}/index.js`);
const folders = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
assert.deepEqual(topics.map((t) => t.id).sort(), folders.sort(), 'cada carpeta de Sciences está en index.js y al revés');
for (const { id } of topics) {
  const { study, exercises } = await loadTopic('4-primaria', 'sciences', id);
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
// Dibujos con partes numeradas: cada número marcado tiene sus preguntas «what» y «which» (y viceversa), y no hay pistas con los nombres en el dibujo.
for (const { id } of topics) {
  if (!fs.existsSync(new URL(`${dir.href}${id}/figures.js`))) continue;
  const figures = await import(`${dir.href}${id}/figures.js`);
  const { exercises } = await import(`${dir.href}${id}/exercises.js`);
  for (const [name, svg] of Object.entries(figures)) {
    const marked = [...svg.matchAll(/<text [^>]*>(\d+)<\/text>/g)].map((m) => Number(m[1])).sort((x, y) => x - y);
    assert.ok(marked.length >= 4 && new Set(marked).size === marked.length, `${id}/${name}: números marcados`);
    assert.deepEqual(marked, marked.map((_, i) => i + 1), `${id}/${name}: numeración 1..N`);
    const qs = exercises.filter((q) => q.visual === svg);
    const nums = (kind) => qs.map((q) => q.id.match(new RegExp(`-${kind}-(\\d+)$`))?.[1]).filter(Boolean).map(Number).sort((x, y) => x - y);
    assert.deepEqual(nums('what'), marked, `${id}/${name}: falta «What is number N?»`);
    assert.deepEqual(nums('which'), marked, `${id}/${name}: falta «Which number is…?»`);
    assert.ok(qs.some((q) => q.type === 'text'), `${id}/${name}: falta una pregunta de escribir`);
    assert.ok(/class="sci-fig"/.test(svg) && /viewBox/.test(svg), `${id}/${name}: svg sin class/viewBox`);
    // el pie de foto no puede dar los nombres de las partes
    const caption = (svg.match(/<text [^>]*font-size="11"[^>]*>([^<]*)<\/text>/) || [])[1] || '';
    assert.ok(!/\d\s*[·\-]/.test(caption), `${id}/${name}: el pie de foto da pistas`);
    console.log(`  ✓ dibujo ${name}: ${marked.length} partes con sus preguntas`);
  }
}
