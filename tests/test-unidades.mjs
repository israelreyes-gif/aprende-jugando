// Las unidades de una asignatura se ven plegadas y se despliegan al tocarlas.
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>');
Object.assign(globalThis, { window: dom.window, document: dom.window.document });
const R = new URL('../js', import.meta.url).pathname;
const { topicGroup } = await import(`${R}/features/subjects/topic-group.js`);
const { groupTopics } = await import(`${R}/features/subjects/group-topics.js`);
const { h } = await import(`${R}/core/dom.js`);

const subject = { tint: '#eef', deep: '#336' };
const card = (t) => h('div', { class: 'card' }, t);

const g = topicGroup({ unit: 'Unit 1 · Practice Time', subject, cards: [card('a'), card('b')] });
assert.equal(g.tagName, 'DETAILS'); assert.equal(g.open, false); console.log('✓ la unidad empieza plegada');
assert.match(g.querySelector('summary').textContent, /Unit 1 · Practice Time/);
assert.match(g.querySelector('.topic-group__count').textContent, /2 temas/); console.log('✓ el título muestra el número de temas');
g.open = true; assert.equal(g.querySelectorAll('.card').length, 2); console.log('✓ al desplegarla están sus tarjetas');
assert.match(topicGroup({ unit: 'U', subject, cards: [card('a')] }).querySelector('.topic-group__count').textContent, /1 tema$/); console.log('✓ singular: "1 tema"');
const plain = topicGroup({ unit: null, subject, cards: [card('a')] });
assert.equal(plain.tagName, 'DIV'); assert.equal(plain.classList.contains('topic-list'), true); console.log('✓ sin unidad: lista normal, sin plegar');

const groups = groupTopics([{ unit: 'A' }, { unit: 'A' }, { unit: 'B' }, {}]);
assert.deepEqual(groups.map((x) => [x.unit, x.items.length]), [['A', 2], ['B', 1], [null, 1]]); console.log('✓ los temas se agrupan por unidad');
