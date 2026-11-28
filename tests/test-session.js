import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>');
Object.assign(globalThis, { window: dom.window, document: dom.window.document });
const { questionTypes: K } = await import('../js/exercises/kinds/index.js');
const { bankQuestions } = await import('../js/exercises/bank.js');
const { buildSession } = await import('../js/exercises/session.js');
const { choiceQ } = await import('../js/exercises/make/choice.js');
const { numberQ } = await import('../js/exercises/make/number.js');
const { multiQ } = await import('../js/exercises/make/multi.js');
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };

const rows = [['¿Lados de un pentágono?', 5], ['Triángulo de 3 lados iguales', 'equilátero', 'isósceles', 'escaleno'], ['¿Año?', 1492, { explain: 'Colón', thousands: false }], ['Con dibujo', 'a', 'b', { visual: '<svg/>', explain: 'x' }]];
const qs = bankQuestions(rows);
assert.deepEqual(qs.map((q) => q.id), ['b1', 'b2', 'b3', 'b4']);
assert.equal(qs[0].type, 'number'); assert.equal(qs[1].type, 'choice'); assert.equal(qs[2].explain, 'Colón'); assert.equal(qs[3].visual, '<svg/>'); assert.deepEqual(qs[3].options, ['a', 'b']);
assert.ok(K.number.check(qs[0], 5)); assert.ok(K.choice.check(qs[1], 0)); assert.equal(K.choice.answerText(qs[1]), 'equilátero');
assert.equal(bankQuestions(rows, 'g')[0].id, 'g1'); ok('banco: filas -> preguntas (número, elegir, extras, ids estables)');

const mq = multiQ('p', [{ label: 'a', answer: 1 }], 'e'); assert.equal(mq.type, 'multi'); assert.equal(numberQ('p', 3, 'e').answer, 3); assert.equal(choiceQ('p', 'x', ['y'], 'e').answer, 0); ok('constructores');

const fixed = Array.from({ length: 8 }, (_, i) => ({ id: 'q' + i, type: 'number', prompt: 'p', answer: i }));
let s = buildSession(fixed); assert.equal(s.length, 8); assert.equal(new Set(s.map((q) => q.id)).size, 8); ok('solo fijas (8): todas, sin repetir');
s = buildSession(fixed.slice(0, 5)); assert.equal(s.length, 5); ok('solo fijas (5): no inventa repeticiones');
s = buildSession(bankQuestions(Array.from({ length: 100 }, (_, i) => ['q' + i, i])), 6); assert.equal(s.length, 6); assert.equal(new Set(s.map((q) => q.id)).size, 6); ok('banco de 100: saca 6 distintas');

let calls = 0;
const gens = [1, 2, 3].map((i) => ({ id: 'g' + i, generate: () => ({ type: 'number', prompt: 'p' + ++calls, answer: calls }) }));
s = buildSession(gens, 8); assert.equal(s.length, 8); assert.equal(calls, 8);
assert.equal(new Set(s.map((q) => q.prompt)).size, 8); assert.ok(s.every((q) => /^g[123]$/.test(q.id)));
const per = {}; s.forEach((q) => (per[q.id] = (per[q.id] || 0) + 1)); assert.ok(Object.values(per).every((c) => c >= 2 && c <= 3)); ok('generadores: datos nuevos cada vez, id del generador, reparto parejo');

const mixed = [...fixed, { id: 'tap', always: true, generate: () => ({ type: 'tap', prompt: 't', items: [] }) }];
for (let i = 0; i < 50; i++) { s = buildSession(mixed, 6); assert.equal(s.length, 6); assert.equal(s.filter((q) => q.id === 'tap').length, 1); }
assert.deepEqual(buildSession([]), []); ok('always: el generador marcado sale siempre; lista vacía -> []');
console.log(n, 'comprobaciones OK');

// Fijas + un generador: las fijas no se repiten aunque haya que completar la sesión con generadores
const fixed3 = fixed.slice(0, 3); const one = { id: 'gen', generate: () => ({ type: 'number', prompt: 'x', answer: 1 }) };
for (let i = 0; i < 100; i++) { s = buildSession([...fixed3, one], 8); assert.equal(s.length, 8); for (const f of fixed3) assert.ok(s.filter((q) => q.id === f.id).length <= 1, 'fija repetida'); }
ok('fijas + generador: las fijas salen como mucho una vez; el resto lo completa el generador');

// Enter mantenido: la repetición no pulsa el botón ni vuelve a enviar
const { questionView } = await import('../js/features/practice/question-view.js'); const { es } = await import('../js/shared/i18n/es.js');
let checkedN = 0, continued = 0;
const view = questionView({ q: { id: 'q', type: 'text', prompt: 'p', answers: ['a'] }, index: 0, total: 2, t: es, onChecked: () => checkedN++, onContinue: () => continued++ });
const root = document.createElement('div'); root.append(...view.nodes); document.body.append(root);
const input = root.querySelector('input'); const button = root.querySelector('.btn--primary');
input.value = 'a'; input.dispatchEvent(new window.Event('input'));
const key = (el, repeat) => { const e = new window.KeyboardEvent('keydown', { key: 'Enter', repeat, bubbles: true, cancelable: true }); el.dispatchEvent(e); return e; };
assert.equal(key(input, true).defaultPrevented, true); assert.equal(checkedN, 0, 'una repetición no envía');
key(input, false); assert.equal(checkedN, 1);
assert.equal(key(button, true).defaultPrevented, true, 'la repetición sobre el botón se cancela (no activa Siguiente)'); assert.equal(key(button, false).defaultPrevented, false); assert.equal(continued, 0);
ok('Enter mantenido: no se envía varias veces y la repetición no pulsa Siguiente');
