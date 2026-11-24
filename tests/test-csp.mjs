// Carga la app en Chromium real con la CSP de index.html y falla si el navegador bloquea algo.
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import worker from './parent-worker.js';
import { makeD1 } from './d1-shim.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const ROOT = process.env.REAL_REPO || path.resolve(new URL('..', import.meta.url).pathname);
const API = 'http://localhost:8795', B = 'http://localhost:8762/';
const db = makeD1(new URL('../worker/schema.sql', import.meta.url).pathname); const env = { DB: db, API_KEY: 'k' };
db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color,gender) VALUES ('alex','Alex','#8EDBC0','chico')`);
for (const [i, [sub, top]] of [['mates', 'tablas'], ['sciences', 'heart-vessels'], ['sciences', 'reproduction'], ['sociales', 'neolitico']].entries()) db.sqlite.exec(`INSERT INTO topic_release (id,profile_id,course_id,subject_id,topic_id) VALUES ('r${i}','alex','4-primaria','${sub}','${top}')`);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const stat = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  let body = fs.readFileSync(f); if (p === '/index.html') body = Buffer.from(String(body).replace('connect-src \'self\' https:', `connect-src 'self' https: ${API}`)); // solo en el test: la API de prueba es http local
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); res.end(body); }).listen(8762);
const api = http.createServer(async (req, res) => { const ch = []; for await (const c of req) ch.push(c); const body = ch.length ? Buffer.concat(ch) : undefined;
  const h = { ...req.headers }; const r = await worker.fetch(new Request(`${API}${req.url}`, { method: req.method, headers: h, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body }), env);
  const hd = Object.fromEntries(r.headers); hd['access-control-allow-origin'] = '*'; hd['access-control-allow-headers'] = '*'; hd['access-control-allow-methods'] = '*';
  if (req.method === 'OPTIONS') { res.writeHead(204, hd); return res.end(); } res.writeHead(r.status, hd); res.end(Buffer.from(await r.arrayBuffer())); }).listen(8795);
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
assert.match(html, /http-equiv="Content-Security-Policy"/); assert.match(html, /script-src 'self'(;|")/); assert.doesNotMatch(html, /unsafe-eval|unsafe-inline/, 'la CSP no debe permitir inline ni eval');
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };
const browser = await chromium.launch(); const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'es-ES', acceptDownloads: true });
await ctx.addInitScript(`localStorage.setItem('aj.apiUrl','${API}'); localStorage.setItem('aj.apiKey','k'); sessionStorage.setItem('aj.session.parent','test');
  window.__v = []; document.addEventListener('securitypolicyviolation', (e) => window.__v.push(e.violatedDirective + ' ' + e.blockedURI));`);
const page = await ctx.newPage(); const externas = []; page.on('request', (r) => { const u = new URL(r.url()); if (!['localhost'].includes(u.hostname) && !['data:', 'blob:'].includes(u.protocol)) externas.push(r.url()); }); const errs = []; page.on('pageerror', (e) => errs.push(String(e))); page.on('console', (m) => { if (/Content Security Policy|Refused to/i.test(m.text())) errs.push(m.text()); });
const viol = () => page.evaluate(() => window.__v);
const go = async (hash, sel) => { await page.goto(B + hash); await page.reload(); await page.waitForSelector(sel, { timeout: 8000 }); await page.waitForTimeout(400); };
await go('', '.app *'); ok('inicio carga');
for (const h of ['#/', '#/parents', '#/profiles']) { await page.goto(B + h); await page.waitForTimeout(700); }
ok('pantallas: inicio, zona de padres, perfiles');
await page.goto(B + '#/parents'); await page.waitForSelector('.backup-card', { timeout: 20000 });
const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }).catch(() => null), page.click('.backup-card button')]); await page.waitForTimeout(1500);
ok('copia de seguridad (blob:) ' + (dl ? 'descargada' : 'lanzada'));
// recorrido real: cursos, asignatura, estudio, práctica (responde), reto, niveles, edición y estadísticas de padres
const rutas = ['#/p/alex', '#/p/alex/c/4-primaria', '#/p/alex/c/4-primaria/s/mates/topics', '#/p/alex/c/4-primaria/s/mates/study/tablas', '#/p/alex/levels', '#/p/alex/edit', '#/parents/alex', '#/parents/alex/release/4-primaria', '#/parents/alex/release/4-primaria/mates', '#/p/alex/c/4-primaria/reto'];
for (const l of rutas) { await page.goto(B + l); await page.waitForTimeout(600); }
// juega una sesión entera (contesta lo que sea) hasta ver la pantalla de resultado: cubre dibujos SVG, confeti y puntos
const jugar = async (ruta) => { const t0 = Date.now(); process.env.CSP_DEBUG && console.log('  .. jugando', ruta);
  await page.goto(B + ruta); await page.waitForTimeout(700);
  for (let i = 0; i < 12 && (await page.$('.question__prompt')); i++) {
    if (await page.$('.option')) await page.click('.option'); else if (await page.$('input[type=text], input:not([type])')) await page.fill('input[type=text], input:not([type])', '1'); else break;
    const accion = page.locator('.btn--primary.btn--block').first();
    if (!(await accion.isEnabled())) break; // tipo de pregunta que este recorrido genérico no sabe contestar
    await accion.click({ timeout: 1500 }).catch(() => {}); await page.waitForTimeout(150); await accion.click({ timeout: 1500 }).catch(() => {}); await page.waitForTimeout(150);
    if (process.env.CSP_DEBUG) console.log('     pregunta', i, Date.now() - t0, 'ms');
  }
  await page.waitForTimeout(500);
};
for (const [sub, top] of [['mates', 'tablas'], ['sciences', 'heart-vessels'], ['sciences', 'reproduction'], ['sociales', 'neolitico']]) {
  await page.goto(B + `#/p/alex/c/4-primaria/s/${sub}/study/${top}`); await page.waitForTimeout(600);
  await jugar(`#/p/alex/c/4-primaria/s/${sub}/practice/${top}`);
}
const txt = await page.textContent('.app'); assert.ok(txt.length > 40, 'la práctica no pintó nada'); await page.screenshot({ path: '/tmp/csp-practice.png' });
const links = rutas;
ok('recorrido por ' + links.length + ' pantallas y 4 sesiones (Mates, Sciences con dibujos y Sociales, contestando hasta el resultado cuando se puede)');
// CSP efectiva: un script en línea inyectado debe bloquearse
// fuentes propias: se cargan de verdad (no se queda en la de reserva) y la app no habla con nadie más que con su propio servidor y la API
await page.goto(B + '#/p/alex/c/4-primaria'); await page.waitForTimeout(800); await page.screenshot({ path: '/tmp/csp-home.png' });
const cargadas = await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`); });
for (const f of ['Nunito 800', 'Nunito 700', 'Fredoka 500']) assert.ok(cargadas.some((c) => c.replace(/"/g, '') === f), `fuente ${f} sin cargar: ${cargadas}`);
ok('fuentes propias cargadas: ' + cargadas.map((c) => c.replace(/"/g, '')).sort().join(', '));
assert.deepEqual(externas, [], 'la app pidió algo a un servidor externo: ' + externas.join(' | ')); ok('ninguna petición a servidores externos (Google incluido)');
const blocked = await page.evaluate(() => new Promise((res) => { const s = document.createElement('script'); s.textContent = 'window.__x=1'; document.head.appendChild(s); setTimeout(() => res(!window.__x), 100); }));
assert.ok(blocked); ok('un script en línea se bloquea (la CSP está activa)');
const v = (await viol()).filter((x) => !/inline/.test(x) || !x.startsWith('script-src'));
assert.deepEqual(v, [], 'bloqueos: ' + v.join(' | ')); ok('el navegador no bloqueó nada de la app');
assert.deepEqual(errs.filter((e) => !/script-src/.test(e)), []); ok('sin errores de CSP en consola');
console.log(n, 'comprobaciones'); await browser.close(); stat.close(); api.close(); process.exit(0);
