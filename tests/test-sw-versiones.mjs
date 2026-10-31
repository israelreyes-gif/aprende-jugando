// El service worker REAL en un Chromium real, con una mini-app que cambia de versión varias veces.
// Comprueba: nunca se mezclan archivos de dos versiones, un fallo a medias no rompe nada, sin conexión sigue abriendo
// y solo se bajan los archivos que han cambiado.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { manifestText } from '../tools/manifest-text.js';
const { chromium } = createRequire(import.meta.url)('playwright');

const repo = new URL('../', import.meta.url).pathname;
const site = fs.mkdtempSync(path.join(os.tmpdir(), 'aprende-sw-'));
fs.mkdirSync(`${site}/js`); fs.mkdirSync(`${site}/sw`);
fs.copyFileSync(`${repo}sw.js`, `${site}/sw.js`);
for (const file of fs.readdirSync(`${repo}sw`)) if (file !== 'manifest.js') fs.copyFileSync(`${repo}sw/${file}`, `${site}/sw/${file}`);

/** Publica una versión de la mini-app: cada archivo dice de qué versión es. */
function deploy(version, versions = { a: version, b: version, c: version }) {
  fs.writeFileSync(`${site}/index.html`, `<!doctype html><html><body>app ${version}</body></html>`);
  for (const [name, v] of Object.entries(versions)) fs.writeFileSync(`${site}/js/${name}.js`, `export const v = '${name}-${v}';`);
  fs.writeFileSync(`${site}/sw/manifest.js`, manifestText(site));
}

const hits = {}; // cuántas veces se ha pedido cada archivo al servidor
let broken = {}; // ruta → respuesta falsa ({status} o {body})
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x'); const p = url.pathname === '/' ? '/index.html' : url.pathname;
  hits[p] = (hits[p] || 0) + 1;
  if (broken[p]?.status) { res.writeHead(broken[p].status); return res.end('no'); }
  if (broken[p]?.body !== undefined) { res.writeHead(200, { 'Content-Type': 'text/javascript' }); return res.end(broken[p].body); }
  const file = path.join(site, p);
  if (!fs.existsSync(file)) { res.writeHead(404); return res.end('no'); }
  res.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : p.endsWith('.html') ? 'text/html' : 'application/octet-stream', 'Cache-Control': 'max-age=3600' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
const ok = (name) => console.log(`✓ ${name}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, what, ms = 8000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await fn()) return; await sleep(100); } assert.fail(`no ocurrió: ${what}`); }
const text = (p) => page.evaluate(async (u) => (await fetch(u)).text(), p);
const seen = async () => (await Promise.all(['/js/a.js', '/js/b.js', '/js/c.js'].map(text))).map((t) => t.match(/'(.+)'/)[1]);
const cacheNames = () => page.evaluate(() => caches.keys());
const swState = () => page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return { waiting: !!r.waiting, installing: !!r.installing }; });
const askUpdate = () => page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update().catch(() => 'fallo'));
const controlled = () => page.evaluate(() => !!navigator.serviceWorker.controller);

// 1 ───────── primera instalación
deploy('v1');
await page.goto(`${base}/index.html`);
await page.evaluate(() => navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }));
await until(controlled, 'la app queda controlada por el service worker');
await until(async () => (await cacheNames()).length === 1, 'una copia guardada');
assert.deepEqual(await seen(), ['a-v1', 'b-v1', 'c-v1']);
ok('primera instalación: todos los archivos de la versión 1, en una sola copia');

// 2 ───────── sin conexión
await ctx.setOffline(true);
assert.deepEqual(await seen(), ['a-v1', 'b-v1', 'c-v1']);
await page.reload(); assert.match(await page.content(), /app v1/);
await ctx.setOffline(false);
ok('sin conexión: sigue sirviendo los archivos y abre la app');

// 3 ───────── versión 2: se baja entera, espera, y no se mezcla nada
deploy('v2', { a: 'v2', b: 'v2', c: 'v1' }); // c no cambia
for (const k of Object.keys(hits)) delete hits[k];
await askUpdate();
await until(async () => (await swState()).waiting, 'versión 2 en espera');
assert.deepEqual(await seen(), ['a-v1', 'b-v1', 'c-v1']);
ok('versión 2 descargada y en espera; mientras tanto la app sigue siendo 100 % la versión 1');
assert.ok((hits['/js/a.js'] || 0) >= 1 && (hits['/js/b.js'] || 0) >= 1);
assert.equal(hits['/js/c.js'], undefined);
ok('solo se bajan los archivos que han cambiado (a y b sí; c, que no cambia, se copia de la versión anterior)');

// 4 ───────── pulsar "Actualizar"
const changed = page.evaluate(() => new Promise((r) => navigator.serviceWorker.addEventListener('controllerchange', r, { once: true })));
await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).waiting.postMessage({ type: 'skip-waiting' }));
await changed;
assert.deepEqual(await seen(), ['a-v2', 'b-v2', 'c-v1']);
await until(async () => (await cacheNames()).length === 1, 'la copia vieja se borra');
ok('al actualizar pasa a la versión 2 de golpe y se borra la copia de la 1');

// 5 ───────── versión 3 con un archivo que falta en el servidor: se descarta, sigue la 2
deploy('v3', { a: 'v3', b: 'v3', c: 'v1' }); broken = { '/js/b.js': { status: 404 } };
await askUpdate(); await sleep(1500);
assert.equal((await swState()).waiting, false);
assert.deepEqual(await seen(), ['a-v2', 'b-v2', 'c-v1']);
assert.equal((await cacheNames()).length, 1);
ok('descarga a medias (falta un archivo): se descarta entera y la app sigue con la versión 2, sin restos');

// 6 ───────── versión 4 con un archivo viejo en el servidor (retraso del servidor): se descarta
deploy('v4', { a: 'v4', b: 'v4', c: 'v1' }); broken = { '/js/a.js': { body: "export const v = 'a-v2';" } };
await askUpdate(); await sleep(1500);
assert.equal((await swState()).waiting, false); assert.equal((await cacheNames()).length, 1);
ok('un archivo de otra versión (el servidor va retrasado): se descarta, no se mezcla');

// 7 ───────── el servidor ya sirve bien: se instala
broken = {};
await askUpdate();
await until(async () => (await swState()).waiting, 'versión 4 en espera tras reintentar');
assert.deepEqual(await seen(), ['a-v2', 'b-v2', 'c-v1']);
ok('al reintentar con el servidor al día, la versión 4 se descarga y espera');

// 8 ───────── primera versión del sistema nuevo tras uno antiguo (copia sin huellas): se activa sola
await page.evaluate(async () => { const names = await caches.keys(); const c = await caches.open(names[names.length - 1]); await c.delete('./__huellas.json'); });
deploy('v5');
const takeover = page.evaluate(() => new Promise((r) => navigator.serviceWorker.addEventListener('controllerchange', r, { once: true })));
await askUpdate(); await takeover;
assert.deepEqual(await seen(), ['a-v5', 'b-v5', 'c-v5']);
ok('si la copia anterior es del sistema antiguo (sin huellas), la nueva se activa sola y completa');

await browser.close(); server.close(); fs.rmSync(site, { recursive: true, force: true });
console.log('sin errores');
process.exit(0);
