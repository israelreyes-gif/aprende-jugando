import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>');
Object.assign(globalThis, { window: dom.window, document: dom.window.document, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } });
const R = new URL('../js', import.meta.url).pathname;
const { loadTopic, loadTopics } = await import(`${R}/content/registry.js`);

// Una frase "Build the sentence" con fichas afirmativa y negativa (could/couldn't…) necesita pista de polaridad:
// si no, hay dos frases correctas y la app marcaría mal una buena.
let checked = 0;
for (const course of ['1-primaria', '4-primaria']) {
  for (const meta of await loadTopics(course, 'ingles')) {
    const { exercises } = await loadTopic(course, 'ingles', meta.id);
    for (let round = 0; round < 80; round++) for (const e of exercises) {
      const q = e.generate ? e.generate() : e;
      if (q.type !== 'words') continue;
      const chips = [...q.answer, ...(q.extra || [])].map((w) => w.toLowerCase());
      const pair = chips.some((w) => /n't$/.test(w) && chips.includes(w.slice(0, -3)));
      checked++;
      if (pair) assert.ok(/\((affirmative|negative|question)\)/.test(q.prompt), `polaridad ambigua · ${course}/${meta.id}/${e.id}: ${q.prompt} · ${chips}`);
    }
  }
}
console.log(`✓ polaridad: ${checked} preguntas "words" revisadas sin ambigüedad`);
