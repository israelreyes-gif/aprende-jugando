import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'https://yo.github.io/aprende/', pretendToBeVisual: true });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, location: window.location, localStorage: window.localStorage, sessionStorage: window.sessionStorage });
const P = '../js';
const { isBusyRoute } = await import(`${P}/update/is-busy-route.js`);
const { watchUpdates } = await import(`${P}/update/watch-updates.js`);
let ok = 0; const t = async (name, fn) => { try { await fn(); ok++; console.log('  ✓', name); } catch (e) { console.log('  ✗', name, '\n    ', e.message.split('\n')[0]); process.exitCode = 1; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await t('pantallas ocupadas: ejercicios, reto y formularios', () => {
  for (const p of ['/p/a/c/4-primaria/s/mates/practice/tablas', '/p/a/c/4-primaria/reto', '/new-profile', '/p/a/edit']) assert.equal(isBusyRoute(p), true, p);
  for (const p of ['/', '/p/a', '/p/a/c/4-primaria', '/p/a/c/4-primaria/s/mates/practice', '/p/a/c/4-primaria/s/mates/study', '/p/a/c/4-primaria/s/mates/study/tablas', '/parents', '/parents/a']) assert.equal(isBusyRoute(p), false, p);
});

const worker = new window.EventTarget(); worker.startMessages = () => {};
let reloads = 0; watchUpdates(worker, () => reloads++);
const send = (data) => { const e = new window.Event('message'); e.data = data; worker.dispatchEvent(e); };
const modal = () => document.querySelector('.modal');
const click = (label) => [...document.querySelectorAll('.modal button')].find((b) => b.textContent === label).click();

await t('un mensaje que no es de actualización se ignora', async () => { location.hash = '#/p/a/c/4-primaria'; send({ type: 'otra-cosa' }); await sleep(20); assert.equal(modal(), null); });
await t('en una pantalla tranquila sale la ventana "Hay una versión nueva"', async () => {
  location.hash = '#/p/a/c/4-primaria'; await sleep(20); send({ type: 'app-updated' }); await sleep(20);
  assert.ok(modal()); assert.match(modal().textContent, /Hay una versión nueva/); assert.match(modal().textContent, /misma pantalla/);
  assert.deepEqual([...document.querySelectorAll('.modal button')].map((b) => b.textContent), ['Ahora no', 'Actualizar']);
});
await t('"Actualizar" recarga la app', async () => { click('Actualizar'); await sleep(20); assert.equal(reloads, 1); assert.equal(modal(), null); });
await t('"Ahora no" cierra y no vuelve a preguntar enseguida', async () => {
  send({ type: 'app-updated' }); await sleep(20); assert.ok(modal()); click('Ahora no'); await sleep(20); assert.equal(modal(), null); assert.equal(reloads, 1);
  send({ type: 'app-updated' }); await sleep(20); assert.equal(modal(), null);
});
console.log('\n' + ok + ' comprobaciones OK');
