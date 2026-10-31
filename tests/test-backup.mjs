import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequire } from 'node:module';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const API = 'http://localhost:8793', B = 'http://localhost:8761/';
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname); const env = { DB: db, API_KEY: 'k' };
db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color,gender) VALUES ('alex','Alex','#8EDBC0','chico'),('lucia','Lucía','#FFB3CC','chica')`);
db.sqlite.exec(`INSERT INTO settings (key,value) VALUES ('parent_pin','SECRETO-HASH')`);
db.sqlite.prepare(`INSERT INTO practice_sessions (id,profile_id,course_id,subject_id,topic_id,total,correct,duration_s,finished_at,kind) VALUES ('s1','alex','4-primaria','mates','tablas',8,6,60,?, 'practice')`).run(new Date().toISOString());
const ins = db.sqlite.prepare(`INSERT INTO answers (id,session_id,question_id,is_correct,given) VALUES (?,?,?,?,?)`);
for (let i = 0; i < 2300; i++) ins.run('a' + i, 's1', 'q' + (i % 8), i % 2, 'x'); // más de 2 páginas
db.sqlite.prepare(`INSERT INTO push_devices (id,profile_id,kind,endpoint,p256dh,auth) VALUES ('d1','alex','child','https://x/secreto','k','a')`).run();
const server = http.createServer(async (req, res) => { const chunks = []; for await (const c of req) chunks.push(c); const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const r = await worker.fetch(new Request(`${API}${req.url}`, { method: req.method, headers: req.headers, body: ['GET','HEAD'].includes(req.method) ? undefined : body }), env);
  res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer())); }).listen(8793);
const getSetting = () => db.sqlite.prepare(`SELECT value FROM settings WHERE key='last_backup_at'`).get()?.value;
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };
const browser = await chromium.launch(); const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'es-ES' });
await ctx.addInitScript(`localStorage.setItem('aj.apiUrl','${API}'); localStorage.setItem('aj.apiKey','k'); sessionStorage.setItem('aj.parentsUnlockedUntil', String(Date.now()+600000));
  window.__mode = 'ok'; window.__shared = null;
  navigator.canShare = () => true;
  navigator.share = async ({ files }) => { if (window.__mode === 'abort') throw Object.assign(new Error('x'), { name: 'AbortError' }); if (window.__mode === 'tap') { window.__mode = 'ok'; throw Object.assign(new Error('x'), { name: 'NotAllowedError' }); } window.__shared = { name: files[0].name, text: await files[0].text() }; };`);
const page = await ctx.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
const open = async () => { await page.goto(B + '#/parents'); await page.reload(); await page.waitForSelector('.backup-card'); };
await open();
assert.ok(await page.locator('.backup-card--due').count() === 1); assert.match(await page.textContent('.backup-card'), /Todavía no has hecho ninguna copia/);
assert.equal(await page.evaluate(() => document.querySelector('.screen__body').children[1].className), 'backup-card backup-card--due'); ok('sin copias: aviso amarillo arriba, justo bajo el texto de elegir perfil');
await page.screenshot({ path: 'shots/backup-due.png' });
// cancelar: no se apunta
await page.evaluate(() => (window.__mode = 'abort')); await page.click('.backup-card button'); await page.waitForTimeout(1500);
assert.equal(getSetting(), undefined); assert.match(await page.textContent('.backup-card'), /Hacer copia/); ok('cancelar la hoja de compartir no apunta la fecha');
// el móvil pide otro toque
await page.evaluate(() => (window.__mode = 'tap')); await page.click('.backup-card button'); await page.waitForTimeout(1500);
assert.equal(getSetting(), undefined); assert.match(await page.textContent('.backup-card'), /Pulsa para guardarla/); assert.match(await page.textContent('.backup-card button'), /Guardar copia/); ok('si el móvil exige otro toque, la copia queda lista y se pide pulsar');
await page.click('.backup-card button'); await page.waitForTimeout(800);
const shared = await page.evaluate(() => window.__shared); assert.ok(shared); assert.match(shared.name, /^aprende-copia-\d{4}-\d{2}-\d{2}\.json$/);
const data = JSON.parse(shared.text);
assert.equal(data.app, 'aprende-y-juega'); assert.deepEqual(Object.keys(data.tables), ['profiles', 'practice_sessions', 'answers', 'study_progress', 'topic_release', 'reto_diario']);
assert.equal(data.tables.profiles.length, 2); assert.equal(data.tables.practice_sessions.length, 1); assert.equal(data.tables.answers.length, 2300); assert.equal(new Set(data.tables.answers.map((a) => a.id)).size, 2300); ok('el archivo trae todas las filas (2.300 respuestas en 3 páginas, sin repetir)');
assert.ok(!shared.text.includes('SECRETO-HASH') && !shared.text.includes('secreto') && !('settings' in data.tables) && !('push_devices' in data.tables)); ok('no incluye el PIN ni los móviles con avisos');
assert.ok(getSetting() && Math.abs(Date.now() - new Date(getSetting())) < 60000); assert.match(await page.textContent('.backup-card'), /Copia hecha hoy/); assert.equal(await page.locator('.backup-card--due').count(), 0); ok('al guardar se apunta la fecha en la base de datos y desaparece el aviso');
// volver a entrar: ya no avisa y la tarjeta baja
await open(); assert.equal(await page.locator('.backup-card--due').count(), 0); assert.match(await page.textContent('.backup-card'), /Última copia: hoy/);
assert.notEqual(await page.evaluate(() => document.querySelector('.screen__body').children[1].className), 'backup-card'); ok('copia de hoy: sin aviso y la tarjeta queda abajo');
await page.screenshot({ path: 'shots/backup-ok.png' });
// 6 días: no avisa; 7 días: avisa
const setDays = (d) => db.sqlite.prepare(`UPDATE settings SET value=? WHERE key='last_backup_at'`).run(new Date(Date.now() - d * 86400000 - 60000).toISOString());
setDays(6); await open(); assert.equal(await page.locator('.backup-card--due').count(), 0); assert.match(await page.textContent('.backup-card'), /hace 6 días/); ok('con 6 días no avisa');
setDays(7); await open(); assert.equal(await page.locator('.backup-card--due').count(), 1); assert.match(await page.textContent('.backup-card'), /hace 7 días\. Conviene actualizarla/); ok('con 7 días avisa: "hace 7 días. Conviene actualizarla"');
await page.screenshot({ path: 'shots/backup-old.png' });
// sin hoja de compartir: descarga normal
await page.evaluate(() => { navigator.canShare = () => false; }); const [dl] = await Promise.all([page.waitForEvent('download'), page.click('.backup-card button')]);
assert.match(dl.suggestedFilename(), /^aprende-copia-/); await page.waitForTimeout(500); ok('sin hoja de compartir: se descarga el archivo'); assert.ok(Date.now() - new Date(getSetting()) < 60000); ok('y se apunta la fecha');
assert.deepEqual(errors, []); ok('sin errores'); console.log(n, 'comprobaciones');
await browser.close(); server.close(); process.exit(0);
