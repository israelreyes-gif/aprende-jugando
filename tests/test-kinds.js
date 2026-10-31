import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://x.github.io/a/' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document });
const { questionTypes: K } = await import('../js/exercises/kinds/index.js');
const t = { yourAnswer: 'Tu respuesta' };
const ev = (el, name, init) => el.dispatchEvent(new dom.window.Event(name, { bubbles: true }));
const typ = (el, v) => { el.value = v; ev(el, 'input'); };
function mount(q) {
  const state = { value: undefined, submitted: 0 };
  const w = K[q.type].render(q, { t, onChange: (v) => (state.value = v), onSubmit: () => state.submitted++ });
  document.body.replaceChildren(w.el);
  return { w, state };
}
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };

// number
let q = { type: 'number', prompt: 'p', answer: 223348, thousands: true };
let { w, state } = mount(q); typ(w.el, '223.348');
assert.equal(state.value, 223348); assert.ok(K.number.check(q, state.value)); assert.equal(K.number.answerText(q), '223.348');
typ(w.el, ''); assert.equal(state.value, null);
typ(w.el, '3,5'); assert.equal(state.value, 3.5); ok('number: puntos de miles, coma decimal, vacío -> null');
// text
q = { type: 'text', prompt: 'p', answers: ['Ochenta y ocho mil'] };
assert.ok(K.text.check(q, 'ochenta y OCHO mil.')); assert.ok(!K.text.check(q, 'ochenta y nueve mil')); ok('text: ignora mayúsculas/signos');
// multi
q = { type: 'multi', prompt: 'p', fields: [{ label: 'Cociente', answer: 15 }, { label: 'Resto', answer: 1 }] };
({ w, state } = mount(q)); const ins = [...document.querySelectorAll('input')];
assert.equal(ins.length, 2); typ(ins[0], '15'); assert.equal(state.value, null); typ(ins[1], '1');
assert.deepEqual(state.value, [15, 1]); assert.ok(K.multi.check(q, state.value));
ins[0].dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); assert.equal(state.submitted, 0);
ins[1].dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); assert.equal(state.submitted, 1);
typ(ins[1], '2'); assert.ok(!K.multi.check(q, state.value));
w.lock(); w.reveal(false, state.value);
assert.ok(ins[0].classList.contains('input--correct') && ins[1].classList.contains('input--wrong') && ins[0].disabled);
assert.equal(K.multi.answerText(q), '15 · 1'); ok('multi: valida todos los campos, marca cada uno, Enter avanza/envía');
// rule
q = { type: 'rule', prompt: 'p', fields: [{ label: 'A', kind: 'number' }, { label: 'B', kind: 'number' }], test: ([a, b]) => a % 2 === 1 && b % 2 === 1 && a + b === 100, example: '1 y 99' };
({ w, state } = mount(q)); const r = [...document.querySelectorAll('input')]; typ(r[0], '41'); typ(r[1], '59');
assert.ok(K.rule.check(q, state.value)); typ(r[1], '60'); assert.ok(!K.rule.check(q, state.value)); assert.equal(K.rule.answerText(q), '1 y 99');
q = { type: 'rule', prompt: 'p', fields: [{ label: 'Romano', kind: 'text' }], test: ([s]) => s.length === 2, example: 'XI' };
({ w, state } = mount(q)); typ(document.querySelector('input'), ' XI '); assert.deepEqual(state.value, ['XI']); assert.ok(K.rule.check(q, state.value)); ok('rule: regla con números y con texto');
// words
q = { type: 'words', prompt: 'p', answer: ['ochenta', 'y', 'ocho', 'mil'], extra: ['quince', 'diez'] };
({ w, state } = mount(q)); const pool = () => [...document.querySelectorAll('.word-pool .word')];
assert.equal(pool().length, 6); assert.equal(state.value, null);
for (const word of q.answer) pool().find((b) => b.textContent === word && !b.disabled).click();
assert.deepEqual(state.value, q.answer); assert.ok(K.words.check(q, state.value));
document.querySelector('.word-line .word').click(); assert.equal(state.value.length, 3); assert.ok(!K.words.check(q, state.value));
w.lock(); w.reveal(false); assert.ok(document.querySelector('.word-line--wrong')); assert.ok(pool().every((b) => b.disabled)); ok('words: añadir, quitar, corregir y bloquear');
// duplicado de ficha "y"
q = { type: 'words', prompt: 'p', answer: ['treinta', 'y', 'dos', 'mil', 'veinte', 'y', 'uno'] };
({ w, state } = mount(q)); for (const word of q.answer) pool().find((b) => b.textContent === word && !b.disabled).click();
assert.ok(K.words.check(q, state.value)); ok('words: fichas repetidas (y, y)');
// order
q = { type: 'order', prompt: 'p', answer: ['12.345', '56.789', '98.765'] };
({ w, state } = mount(q)); const items = () => [...document.querySelectorAll('.order__item')];
for (const l of q.answer) items().find((b) => b.firstChild.textContent === l).click();
assert.deepEqual(state.value, q.answer); assert.ok(K.order.check(q, state.value));
items().find((b) => b.firstChild.textContent === '12.345').click(); assert.equal(state.value, null);
items().find((b) => b.firstChild.textContent === '12.345').click(); assert.equal(state.value.at(-1), '12.345'); assert.ok(!K.order.check(q, state.value));
w.lock(); w.reveal(false, state.value); assert.ok(document.querySelector('.order__item--wrong')); ok('order: numera, quita, corrige');
// tap
q = { type: 'tap', prompt: 'p', items: [{ visual: '<svg viewBox="0 0 10 10"><rect width="10" height="10"/></svg>', label: 'cuadrado', correct: true }, { visual: '<svg viewBox="0 0 10 10"><circle r="5"/></svg>', label: 'círculo', correct: false }, { visual: '<svg viewBox="0 0 10 10"><rect width="9" height="5"/></svg>', label: 'rectángulo', correct: true }] };
({ w, state } = mount(q)); const bs = [...document.querySelectorAll('.tap-item')]; assert.equal(bs.length, 3); assert.ok(bs[0].querySelector('svg'));
bs[0].click(); assert.deepEqual(state.value, [0]); assert.ok(!K.tap.check(q, state.value)); bs[2].click(); assert.ok(K.tap.check(q, state.value));
bs[1].click(); assert.ok(!K.tap.check(q, state.value)); bs[1].click(); bs[2].click(); w.lock(); w.reveal(false);
assert.ok(bs[0].classList.contains('tap-item--correct') && bs[2].classList.contains('tap-item--missed')); assert.equal(K.tap.answerText(q), 'cuadrado, rectángulo'); ok('tap: selección múltiple y corrección');
// choice sigue igual
q = { type: 'choice', prompt: 'p', options: ['a', 'b', 'c'], answer: 1 }; ({ w, state } = mount(q)); [...document.querySelectorAll('.option')].find((b) => b.textContent === 'b').click(); assert.ok(K.choice.check(q, state.value)); ok('choice: sin cambios');
console.log(n, 'comprobaciones de tipos OK');
