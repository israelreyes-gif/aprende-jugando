// Respuestas de texto: las tildes no cuentan como error (pero se avisa), la ñ sí.
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { norm } from '../js/shared/text-normalize.js';
import { accentWarning } from '../js/shared/accent-warning.js';
import { text } from '../js/exercises/kinds/text.js';
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };

assert.equal(norm('Árbol'), 'arbol'); assert.equal(norm('  ¡AÑO!  '), 'año'); assert.notEqual(norm('ano'), norm('año')); assert.equal(norm('pingüino'), 'pinguino'); ok('norm: quita tildes y diéresis, conserva la ñ');
const q = (...answers) => ({ type: 'text', answers });
assert.equal(text.check(q('águila'), 'aguila'), true); assert.equal(text.check(q('águila'), 'ÁGUILA'), true); assert.equal(text.check(q('año'), 'año'), true);
assert.equal(text.check(q('año'), 'ano'), false); assert.equal(text.check(q('niño'), 'nino'), false); assert.equal(text.check(q('ano'), 'año'), false);
assert.equal(text.check(q('el león'), 'leon'), true); ok('check: sin tilde vale; sin ñ (o con ñ de más) es error');
assert.deepEqual(accentWarning('aguila', ['águila']), ['águila']);
assert.deepEqual(accentWarning('el arbol grande', ['árbol grande']), ['árbol']);
assert.deepEqual(accentWarning('cancion y corazon', ['canción y corazón']), ['canción', 'corazón']);
assert.deepEqual(accentWarning('águila', ['águila']), []); assert.deepEqual(accentWarning('Águila', ['águila']), []);
assert.deepEqual(accentWarning('cat', ['cat']), []);
// el contenido suele listar las dos formas: se avisa igual si la escribió sin tilde, y no si la escribió bien
assert.deepEqual(accentWarning('aguila', ['aguila', 'águila']), ['águila']); assert.deepEqual(accentWarning('cerámica', ['ceramica', 'cerámica']), []);
assert.deepEqual(accentWarning('un leon', ['leon', 'león', 'un leon', 'un león']), ['león']); assert.deepEqual(accentWarning('dolmenes', ['dolmen', 'dólmenes', 'dolmenes']), ['dólmenes']);
assert.deepEqual(text.note(q('águila'), null), []); assert.deepEqual(text.note(q('águila'), 'aguila'), ['águila']); ok('aviso: palabras sin tilde, varias a la vez, nada si está bien escrito');

const { window } = new JSDOM('<!doctype html><body></body>'); Object.assign(globalThis, { window, document: window.document });
const { feedbackBox } = await import('../js/features/practice/feedback-box.js'); const { es } = await import('../js/shared/i18n/es.js');
const fb = feedbackBox(true, q('águila'), text, es, 'aguila');
assert.match(fb.textContent, /Ojo con la tilde, se escribe: águila/); assert.match(fb.querySelector('.feedback__title').textContent, /Muy bien/);
assert.doesNotMatch(feedbackBox(true, q('águila'), text, es, 'águila').textContent, /tilde/); assert.doesNotMatch(feedbackBox(false, q('año'), text, es, 'ano').textContent, /tilde/);
assert.match(feedbackBox(false, q('año'), text, es, 'ano').textContent, /La respuesta correcta es: año/); ok('cuadro de corrección: acierto con aviso, sin aviso si está bien, y error con ñ');
console.log(`\n${n} comprobaciones OK`);
