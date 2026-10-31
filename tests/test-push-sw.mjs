import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const P = new URL('../', import.meta.url).pathname.replace(/\/$/, '');
let ok = 0; const t = async (name, fn) => { try { await fn(); ok++; console.log('  ✓', name); } catch (e) { console.log('  ✗', name, '\n    ', e.message.split('\n')[0]); process.exitCode = 1; } };

/** Service worker de mentira con el código real de sw.js. */
function makeWorker({ windows = [] } = {}) {
  const handlers = {}; const shown = []; const opened = []; const log = { focused: 0, navigated: [] };
  const clientsList = windows.map(() => ({ focus: async () => { log.focused++; }, navigate: async (u) => { log.navigated.push(u); } }));
  const ctx = {
    console, Response, Request, URL, Promise, Map, setTimeout,
    caches: { open: async () => ({}), keys: async () => [], delete: async () => true },
    fetch: async () => new Response(''),
    self: {
      location: { origin: 'https://yo.github.io' },
      registration: { scope: 'https://yo.github.io/aprende/', showNotification: async (title, options) => { shown.push({ title, options }); } },
      addEventListener: (n, f) => (handlers[n] = f), skipWaiting() {},
      clients: { claim: async () => {}, matchAll: async () => clientsList, openWindow: async (u) => { opened.push(u); } },
    },
    importScripts: (...files) => files.forEach((f) => vm.runInContext(fs.readFileSync(`${P}/${f.replace('./', '')}`, 'utf8'), ctx)),
  };
  ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(`${P}/sw.js`, 'utf8').replace(/^const /gm, 'var '), ctx);
  const run = async (name, event) => { const waits = []; handlers[name]({ ...event, waitUntil: (p) => waits.push(p) }); await Promise.all(waits); };
  return { handlers, shown, opened, log, run };
}
const pushData = (obj) => ({ data: { json: () => JSON.parse(obj), text: () => obj } });

await t('el service worker escucha push y notificationclick', () => { const w = makeWorker(); assert.equal(typeof w.handlers.push, 'function'); assert.equal(typeof w.handlers.notificationclick, 'function'); });
await t('push: muestra título, texto y etiqueta del aviso', async () => {
  const w = makeWorker(); await w.run('push', pushData(JSON.stringify({ title: 'Avisos activados', body: 'Hola Alex', tag: 'x', url: '#/p/alex' })));
  assert.equal(w.shown.length, 1); assert.equal(w.shown[0].title, 'Avisos activados'); assert.equal(w.shown[0].options.body, 'Hola Alex'); assert.equal(w.shown[0].options.tag, 'x'); assert.equal(w.shown[0].options.data.url, '#/p/alex'); assert.match(w.shown[0].options.icon, /icon-192\.png$/);
});
await t('push: con texto que no es JSON también muestra algo', async () => {
  const w = makeWorker(); await w.run('push', { data: { json: () => { throw new SyntaxError('x'); }, text: () => 'texto suelto' } });
  assert.equal(w.shown[0].title, 'Aprende y juega'); assert.equal(w.shown[0].options.body, 'texto suelto');
});
await t('push: sin datos muestra un aviso genérico (iPhone exige mostrar siempre uno)', async () => {
  const w = makeWorker(); await w.run('push', {}); assert.equal(w.shown.length, 1); assert.equal(w.shown[0].title, 'Aprende y juega');
});
await t('tocar el aviso con la app cerrada: abre la app en su dirección', async () => {
  const w = makeWorker(); let closed = false; await w.run('notificationclick', { notification: { close: () => (closed = true), data: { url: '#/p/alex/c/4-primaria/reto' } } });
  assert.ok(closed); assert.deepEqual(w.opened, ['https://yo.github.io/aprende/#/p/alex/c/4-primaria/reto']);
});
await t('tocar el aviso sin dirección: abre la app (inicio)', async () => {
  const w = makeWorker(); await w.run('notificationclick', { notification: { close() {}, data: { url: '' } } }); assert.deepEqual(w.opened, ['https://yo.github.io/aprende/']);
});
await t('tocar el aviso con la app abierta: la trae al frente y va a su dirección', async () => {
  const w = makeWorker({ windows: [1] }); await w.run('notificationclick', { notification: { close() {}, data: { url: '#/parents' } } });
  assert.equal(w.log.focused, 1); assert.deepEqual(w.log.navigated, ['https://yo.github.io/aprende/#/parents']); assert.equal(w.opened.length, 0);
});
await t('tocar un aviso sin dirección con la app abierta: solo la trae al frente', async () => {
  const w = makeWorker({ windows: [1] }); await w.run('notificationclick', { notification: { close() {}, data: {} } });
  assert.equal(w.log.focused, 1); assert.equal(w.log.navigated.length, 0); assert.equal(w.opened.length, 0);
});
console.log('\n' + ok + ' comprobaciones OK');
