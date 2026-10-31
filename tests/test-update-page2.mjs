import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'https://yo.github.io/aprende/', pretendToBeVisual: true });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, location: window.location, localStorage: window.localStorage, sessionStorage: window.sessionStorage });
const P = '../js';
const { watchUpdates } = await import(`${P}/update/watch-updates.js`);
const { confirmDialog } = await import(`${P}/shared/modal.js`);
let ok = 0; const t = async (name, fn) => { try { await fn(); ok++; console.log('  ✓', name); } catch (e) { console.log('  ✗', name, '\n    ', e.message.split('\n')[0]); process.exitCode = 1; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const serviceWorker = new window.EventTarget(); serviceWorker.controller = {};
const registration = new window.EventTarget(); registration.update = async () => {}; registration.waiting = null; registration.installing = null; registration.sent = [];
let reloads = 0; watchUpdates(registration, { serviceWorker, reload: () => { reloads++; registration.waiting = null; } });
const arrive = () => { // llega (o sigue esperando) una versión nueva
  const worker = new window.EventTarget(); worker.state = 'installed'; registration.installing = worker;
  registration.dispatchEvent(new window.Event('updatefound')); registration.waiting = { postMessage: (m) => registration.sent.push(m) }; worker.dispatchEvent(new window.Event('statechange'));
};
const modals = () => document.querySelectorAll('.modal');
const click = (label) => [...document.querySelectorAll('.modal button')].find((b) => b.textContent === label).click();
const accept = async () => { click('Actualizar'); await sleep(20); serviceWorker.dispatchEvent(new window.Event('controllerchange')); await sleep(10); };

await t('haciendo ejercicios: el aviso espera y no interrumpe', async () => { location.hash = '#/p/a/c/4-primaria/s/mates/practice/tablas'; await sleep(30); arrive(); await sleep(30); assert.equal(modals().length, 0); });
await t('al salir de los ejercicios, sale el aviso', async () => { location.hash = '#/p/a/c/4-primaria/s/mates/practice'; await sleep(60); assert.equal(modals().length, 1); assert.match(modals()[0].textContent, /Hay una versión nueva/); await accept(); assert.equal(reloads, 1); });
await t('en el reto también espera, y en un formulario también', async () => { for (const hash of ['#/p/a/c/4-primaria/reto', '#/new-profile']) { location.hash = hash; await sleep(30); arrive(); await sleep(30); assert.equal(modals().length, 0, hash); } location.hash = '#/p/a'; await sleep(60); assert.equal(modals().length, 1); await accept(); });
await t('varios avisos seguidos: una sola ventana', async () => { location.hash = '#/p/a'; await sleep(30); arrive(); arrive(); arrive(); await sleep(30); assert.equal(modals().length, 1); await accept(); assert.equal(modals().length, 0); });
await t('si hay otra ventana abierta no la pisa; sale cuando se cierra', async () => {
  location.hash = '#/p/a/c/4-primaria'; await sleep(30);
  const asked = confirmDialog({ title: '¿Borrar?', message: 'x', confirm: 'Borrar', cancel: 'Cancelar', danger: true });
  await sleep(20); arrive(); await sleep(30);
  assert.equal(modals().length, 1); assert.match(modals()[0].textContent, /¿Borrar\?/);
  click('Cancelar'); assert.equal(await asked, false);
  await sleep(3300); assert.equal(modals().length, 1); assert.match(modals()[0].textContent, /Hay una versión nueva/); await accept();
});
await t('si el cambio de versión no llega a notarse, recarga igualmente a los pocos segundos', async () => {
  const before = reloads; location.hash = '#/p/a'; await sleep(30); arrive(); await sleep(30); click('Actualizar'); await sleep(4300); assert.equal(reloads, before + 1);
});
console.log('\n' + ok + ' comprobaciones OK');
process.exit(process.exitCode || 0);
