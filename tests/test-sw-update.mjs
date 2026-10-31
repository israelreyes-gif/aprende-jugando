import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const P = new URL('../', import.meta.url).pathname.replace(/\/$/, '');
let ok = 0; const t = async (name, fn) => { try { await fn(); ok++; console.log('  ✓', name); } catch (e) { console.log('  ✗', name, '\n    ', e.message.split('\n')[0]); process.exitCode = 1; } };

/** Monta un service worker de mentira con el código real de sw/ y sw.js. */
function makeWorker({ stored = {}, server = {}, offline = false } = {}) {
  const store = new Map(Object.entries(stored).map(([url, [body, type]]) => [url, new Response(body, { headers: { 'content-type': type } })]));
  const messages = []; const handlers = {};
  const key = (req) => (typeof req === 'string' ? req : new URL(req.url).pathname);
  const cache = {
    async match(req) { return store.get(key(req))?.clone(); },
    async put(req, res) { store.set(key(req), res); },
    async delete(req) { return store.delete(key(req)); },
    async addAll() {},
  };
  const ctx = {
    console, Response, Request, URL, Promise, Map, setTimeout,
    caches: { open: async () => cache, keys: async () => [], delete: async () => true },
    fetch: async (req) => { if (offline) throw new TypeError('sin red'); const [body, type, status = 200] = server[new URL(req.url).pathname] || ['', 'text/plain', 404]; return new Response(body, { status, headers: { 'content-type': type } }); },
    self: { location: { origin: 'https://yo.github.io' }, addEventListener: (n, f) => (handlers[n] = f), skipWaiting() {}, clients: { claim: async () => {}, matchAll: async () => [{ postMessage: (m) => messages.push(m) }, { postMessage: (m) => messages.push(m) }] } },
    importScripts: (...files) => files.forEach((f) => vm.runInContext(fs.readFileSync(`${P}/${f.replace('./', '')}`, 'utf8'), ctx)),
  };
  ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(`${P}/sw.js`, 'utf8').replace(/^const /gm, 'var '), ctx);
  const request = (path) => { const r = new Request('https://yo.github.io' + path); return r; };
  async function load(path) { const waits = []; let answer; const event = { request: request(path), respondWith: (p) => (answer = p), waitUntil: (p) => waits.push(p) }; handlers.fetch(event); const res = await answer; const text = await res.clone().text(); await res.text(); await Promise.all(waits); await new Promise((r) => setTimeout(r, 5)); return { res, text }; }
  async function send(data) { const waits = []; const replies = []; handlers.message({ data, source: { postMessage: (m) => replies.push(m) }, waitUntil: (p) => waits.push(p) }); await Promise.all(waits); return replies; }
  return { load, send, messages, store };
}
const JS = 'application/javascript; charset=utf-8';

await t('el service worker sigue sirviendo la copia guardada primero', async () => { const w = makeWorker({ stored: { '/js/a.js': ['viejo', JS] }, server: { '/js/a.js': ['nuevo', JS] } }); const { text } = await w.load('/js/a.js'); assert.equal(text, 'viejo'); });
await t('y deja la copia nueva guardada para la siguiente apertura', async () => { const w = makeWorker({ stored: { '/js/a.js': ['viejo', JS] }, server: { '/js/a.js': ['nuevo', JS] } }); await w.load('/js/a.js'); const { text } = await w.load('/js/a.js'); assert.equal(text, 'nuevo'); });
await t('archivo cambiado → avisa a todas las ventanas', async () => { const w = makeWorker({ stored: { '/js/a.js': ['viejo', JS] }, server: { '/js/a.js': ['nuevo', JS] } }); await w.load('/js/a.js'); assert.equal(JSON.stringify(w.messages), JSON.stringify([{ type: 'app-updated' }, { type: 'app-updated' }])); });
await t('archivo igual → no avisa', async () => { const w = makeWorker({ stored: { '/js/a.js': ['igual', JS] }, server: { '/js/a.js': ['igual', JS] } }); await w.load('/js/a.js'); assert.equal(w.messages.length, 0); });
await t('primera vez (sin copia guardada) → no avisa y lo guarda', async () => { const w = makeWorker({ server: { '/js/a.js': ['nuevo', JS] } }); const { text } = await w.load('/js/a.js'); assert.equal(text, 'nuevo'); assert.equal(w.messages.length, 0); assert.ok(w.store.has('/js/a.js')); });
await t('sin conexión → sirve lo guardado y no avisa', async () => { const w = makeWorker({ stored: { '/js/a.js': ['viejo', JS] }, offline: true }); const { text } = await w.load('/js/a.js'); assert.equal(text, 'viejo'); assert.equal(w.messages.length, 0); });
await t('error del servidor (404) → no avisa y no pisa la copia', async () => { const w = makeWorker({ stored: { '/js/a.js': ['viejo', JS] }, server: { '/js/a.js': ['<h1>404</h1>', 'text/html', 404] } }); await w.load('/js/a.js'); assert.equal(w.messages.length, 0); assert.equal((await w.load('/js/a.js')).text, 'viejo'); });
await t('css, html y svg también se comparan', async () => { for (const [path, type] of [['/css/x.css', 'text/css'], ['/index.html', 'text/html; charset=utf-8'], ['/icons/icon.svg', 'image/svg+xml']]) { const w = makeWorker({ stored: { [path]: ['a', type] }, server: { [path]: ['b', type] } }); await w.load(path); assert.equal(w.messages.length, 2, path); } });
await t('imágenes y otros binarios no se comparan', async () => { const w = makeWorker({ stored: { '/icons/a.png': ['a', 'image/png'] }, server: { '/icons/a.png': ['b', 'image/png'] } }); await w.load('/icons/a.png'); assert.equal(w.messages.length, 0); });
await t('si falla el aviso, la copia nueva se guarda igual', async () => { const w = makeWorker({ stored: { '/js/a.js': ['viejo', JS] }, server: { '/js/a.js': ['nuevo', JS] } }); w.messages.push = () => { throw new Error('boom'); }; await w.load('/js/a.js'); assert.equal((await w.load('/js/a.js')).text, 'nuevo'); });
await t('si ninguna ventana oyó el aviso, "page-ready" lo entrega al abrir (una sola vez)', async () => { const w = makeWorker({ stored: { '/js/a.js': ['viejo', JS] }, server: { '/js/a.js': ['nuevo', JS] } }); await w.load('/js/a.js'); w.messages.length = 0; assert.equal(JSON.stringify(await w.send({ type: 'page-ready' })), JSON.stringify([{ type: 'app-updated' }])); assert.equal((await w.send({ type: 'page-ready' })).length, 0); });
await t('"update-seen" quita la marca: "page-ready" ya no repite el aviso', async () => { const w = makeWorker({ stored: { '/js/a.js': ['viejo', JS] }, server: { '/js/a.js': ['nuevo', JS] } }); await w.load('/js/a.js'); await w.send({ type: 'update-seen' }); assert.equal((await w.send({ type: 'page-ready' })).length, 0); });
await t('sin cambios, "page-ready" no avisa de nada', async () => { const w = makeWorker({ stored: { '/js/a.js': ['igual', JS] }, server: { '/js/a.js': ['igual', JS] } }); await w.load('/js/a.js'); assert.equal((await w.send({ type: 'page-ready' })).length, 0); });
console.log('\n' + ok + ' comprobaciones del service worker OK');
