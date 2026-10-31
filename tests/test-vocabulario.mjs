// Tema Vocabulary: secciones, orden, y ejercicios generados al azar.
import assert from 'node:assert/strict';
import { sections } from '../js/content/4-primaria/ingles/vocabulary/sections.js';
import { study } from '../js/content/4-primaria/ingles/vocabulary/study.js';
import { exercises } from '../js/content/4-primaria/ingles/vocabulary/exercises.js';
import { topics } from '../js/content/4-primaria/ingles/index.js';
import { renderBlocks } from '../js/features/study/lesson-blocks.js';

const ok = (name) => console.log(`✓ ${name}`);
const titles = (list) => list.map((s) => s.title);
const names = (title) => sections.find((s) => s.title === title).words.map((w) => w.en);

assert.deepEqual(titles(sections), ['Colours', 'Days', 'Months', 'Places', 'Furniture', 'Objects', 'Events', 'Jobs', 'Verbs']);
ok('secciones en el orden acordado');

assert.deepEqual(names('Days'), ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
assert.deepEqual(names('Months'), ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']);
ok('días y meses en orden natural');

for (const s of sections.filter((x) => !['Days', 'Months'].includes(x.title))) {
  const sorted = [...s.words.map((w) => w.en)].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  assert.deepEqual(s.words.map((w) => w.en), sorted, s.title);
}
ok('el resto de secciones, por orden alfabético');

const counts = Object.fromEntries(sections.map((s) => [s.title, s.words.length]));
assert.deepEqual(counts, { Colours: 8, Days: 7, Months: 12, Places: 7, Furniture: 6, Objects: 12, Events: 6, Jobs: 12, Verbs: 37 });
ok('número de palabras por sección (Verbs junta las 3 listas de verbos: 37)');

for (const s of sections) assert.equal(new Set(s.words.map((w) => w.en)).size, s.words.length, `repetida en ${s.title}`);
ok('ninguna palabra repetida dentro de una sección');

assert.equal(study.length, 9);
for (const block of study) { assert.ok(block.fold && block.list.length > 0); for (const line of block.list) assert.match(line, /^.+ → .+$/); }
ok('el estudio tiene una sección plegable por grupo, con líneas "en → es"');

const doc = new (await import('jsdom')).JSDOM('<body></body>');
Object.assign(globalThis, { window: doc.window, document: doc.window.document });
const nodes = renderBlocks(study, { speak: false });
assert.equal(nodes.length, 9); assert.ok(nodes.every((n) => n.tagName === 'DETAILS' && !n.open));
assert.equal(nodes[0].querySelector('summary').textContent, 'Colours8'); assert.equal(nodes[0].querySelectorAll('li').length, 8);
ok('se pintan 9 secciones plegadas, con su nombre y su número de palabras');

assert.ok(topics.some((t) => t.id === 'vocabulary' && t.load) && !topics.some((t) => t.id === 'activity-verbs'));
ok('en la lista de temas está Vocabulary y ya no Activity verbs');

const SPANISH = /[áéíóúñ¿¡]|\b(montar|tocar|saltar|el|la|los|las)\b/i;
for (const ex of exercises) {
  for (let i = 0; i < 1500; i++) {
    const q = ex.generate();
    assert.ok(q.prompt && q.explain, ex.id);
    assert.ok(q.say, `${ex.id}: sin texto para 🔊`);
    assert.ok(!SPANISH.test(q.say), `${ex.id}: español en el 🔊: ${q.say}`);
    if (q.type === 'choice') {
      const texts = q.options.map((o) => (typeof o === 'string' ? o : o.text ?? o.label));
      assert.equal(new Set(texts).size, texts.length, `${ex.id}: opciones repetidas ${texts}`);
      assert.ok(q.options.length >= 4, `${ex.id}: pocas opciones`);
    }
    if (q.type === 'text') assert.ok(q.answers.length >= 1);
  }
}
ok('1.500 preguntas de cada ejercicio: con explicación, 🔊 en inglés, opciones distintas');

const write = exercises.find((e) => e.id === 'write-word');
let clase = false;
for (let i = 0; i < 5000 && !clase; i++) { const q = write.generate(); if (q.prompt.endsWith(': clase')) { clase = true; assert.deepEqual([...q.answers].sort(), ['classroom', 'lesson']); } }
assert.ok(clase); ok('"clase" admite classroom y lesson (dos palabras con la misma traducción)');
