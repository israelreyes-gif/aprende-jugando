import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'https://yo.github.io/aprende/', pretendToBeVisual: true });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, location: window.location, localStorage: window.localStorage, sessionStorage: window.sessionStorage });
let visibility = 'visible';
Object.defineProperty(document, 'visibilityState', { get: () => visibility });
const P = '../js';
const { isBusyRoute } = await import(`${P}/update/is-busy-route.js`);
const { watchUpdates } = await import(`${P}/update/watch-updates.js`);
let ok = 0; const t = async (name, fn) => { try { await fn(); ok++; console.log('  ✓', name); } catch (e) { console.log('  ✗', name, '\n    ', e.message.split('\n')[0]); process.exitCode = 1; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await t('pantallas ocupadas: ejercicios, reto y formularios', () => {
  for (const p of ['/p/a/c/4-primaria/s/mates/practice/tablas', '/p/a/c/4-primaria/reto', '/new-profile', '/p/a/edit']) assert.equal(isBusyRoute(p), true, p);
  for (const p of ['/', '/p/a', '/p/a/c/4-primaria', '/p/a/c/4-primaria/s/mates/practice', '/p/a/c/4-primaria/s/mates/study', '/p/a/c/4-primaria/s/mates/study/tablas', '/parents', '/parents/a']) assert.equal(isBusyRoute(p), false, p);
});

/** Un service worker y un registro de mentira con lo mismo que usa la app. */
function makeFakes({ controller = true, waiting = false } = {}) {
  const serviceWorker = new window.EventTarget(); serviceWorker.controller = controller ? {} : null;
  const registration = new window.EventTarget(); registration.updates = 0; registration.sent = [];
  registration.update = async () => { registration.updates++; };
  registration.waiting = waiting ? { postMessage: (m) => registration.sent.push(m) } : null; registration.installing = null;
  return { serviceWorker, registration };
}
const modal = () => document.querySelector('.modal');
const click = (label) => [...document.querySelectorAll('.modal button')].find((b) => b.textContent === label).click();
const install = (registration) => { // llega una versión nueva: se instala y queda esperando
  const worker = new window.EventTarget(); worker.state = 'installing'; registration.installing = worker;
  registration.dispatchEvent(new window.Event('updatefound'));
  worker.state = 'installed'; registration.waiting = { postMessage: (m) => registration.sent.push(m) }; worker.dispatchEvent(new window.Event('statechange'));
};

const f = makeFakes(); let reloads = 0;
watchUpdates(f.registration, { serviceWorker: f.serviceWorker, reload: () => { reloads++; f.registration.waiting = null; } });

await t('sin versión nueva no sale nada', async () => { location.hash = '#/p/a/c/4-primaria'; await sleep(30); assert.equal(modal(), null); });
await t('llega una versión nueva, ya descargada: sale "Hay una versión nueva"', async () => {
  install(f.registration); await sleep(30);
  assert.ok(modal()); assert.match(modal().textContent, /Hay una versión nueva/); assert.match(modal().textContent, /misma pantalla/);
  assert.deepEqual([...document.querySelectorAll('.modal button')].map((b) => b.textContent), ['Ahora no', 'Actualizar']);
});
await t('"Actualizar" pide a la versión nueva que tome el control y, cuando lo hace, recarga', async () => {
  click('Actualizar'); await sleep(20);
  assert.deepEqual(f.registration.sent, [{ type: 'skip-waiting' }]); assert.equal(reloads, 0);
  f.serviceWorker.dispatchEvent(new window.Event('controllerchange')); await sleep(10);
  assert.equal(reloads, 1); assert.equal(modal(), null);
});
await t('si al abrir la app ya hay una versión esperando, se ofrece', async () => {
  const before = reloads; document.querySelectorAll('.modal-overlay').forEach((n) => n.remove());
  const g = makeFakes({ waiting: true }); watchUpdates(g.registration, { serviceWorker: g.serviceWorker, reload: () => { reloads++; g.registration.waiting = null; } }); await sleep(30);
  assert.ok(modal()); assert.match(modal().textContent, /Hay una versión nueva/); click('Actualizar'); await sleep(20); g.serviceWorker.dispatchEvent(new window.Event('controllerchange')); await sleep(10); assert.equal(reloads, before + 1);
});
await t('"Ahora no" cierra y no vuelve a preguntar enseguida', async () => {
  const before = reloads; install(f.registration); await sleep(30); assert.ok(modal()); click('Ahora no'); await sleep(20); assert.equal(modal(), null);
  install(f.registration); await sleep(30); assert.equal(modal(), null); assert.equal(reloads, before);
});
await t('pasados los 10 minutos de "Ahora no", al cambiar de pantalla vuelve a preguntar', async () => {
  const real = Date.now; Date.now = () => real() + 11 * 60 * 1000;
  try { location.hash = '#/p/a/c/4-primaria/s/mates/study'; await sleep(60); assert.ok(modal()); assert.match(modal().textContent, /Hay una versión nueva/); }
  finally { Date.now = real; }
  click('Ahora no'); await sleep(20);
});
await t('al volver a la app (primer plano) se pregunta si hay versión nueva; en segundo plano no', async () => {
  const before = f.registration.updates;
  visibility = 'hidden'; document.dispatchEvent(new window.Event('visibilitychange')); await sleep(10); assert.equal(f.registration.updates, before);
  visibility = 'visible'; document.dispatchEvent(new window.Event('visibilitychange')); await sleep(10); assert.equal(f.registration.updates, before + 1);
});
await t('al recuperar la conexión también se pregunta', async () => { const before = f.registration.updates; window.dispatchEvent(new window.Event('online')); await sleep(10); assert.equal(f.registration.updates, before + 1); });
await t('si preguntar falla (sin red), no pasa nada', async () => { f.registration.update = async () => { throw new TypeError('sin red'); }; document.dispatchEvent(new window.Event('visibilitychange')); await sleep(10); });

await t('la primera instalación (no había versión anterior) no avisa de nada', async () => {
  const g = makeFakes({ controller: false }); watchUpdates(g.registration, { serviceWorker: g.serviceWorker, reload: () => {} });
  const m0 = document.querySelectorAll('.modal').length; install(g.registration); await sleep(30); assert.equal(document.querySelectorAll('.modal').length, m0);
});
console.log('\n' + ok + ' comprobaciones OK');
process.exit(process.exitCode || 0);
