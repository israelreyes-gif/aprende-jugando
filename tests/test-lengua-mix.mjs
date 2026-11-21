// Lengua 4.º: el mix está declarado y listo para cuando haya temas (contenido real del repo).
import assert from 'node:assert/strict';
const real = process.env.REAL_REPO ? `file://${process.env.REAL_REPO}` : new URL('../', import.meta.url).href.replace(/\/$/, '');
const { topics, mixes } = await import(`${real}/js/content/4-primaria/lengua/index.js`);
assert.deepEqual(mixes.map((m) => [m.id, m.size, m.unit]), [['lengua', 36, undefined]], 'Lengua declara su mix de 36 preguntas de toda la asignatura');
assert.ok(Array.isArray(topics));
console.log('  ✓ Lengua: mix declarado (' + topics.length + ' temas por ahora)');
