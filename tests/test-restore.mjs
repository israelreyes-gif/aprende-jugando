import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const API = 'http://localhost:8794', B = 'http://localhost:8761/';
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname); const env = { DB: db, API_KEY: 'k' };
const sq = db.sqlite; const count = (t, w = '1') => sq.prepare(`SELECT COUNT(*) c FROM ${t} WHERE ${w}`).get().c;
sq.exec(`INSERT INTO profiles (id,name,avatar_color,gender) VALUES ('alex','Alex','#8EDBC0','chico'),('lucia','Lucía','#FFB3CC','chica')`);
sq.exec(`INSERT INTO settings (key,value) VALUES ('parent_pin','SECRETO-HASH')`);
const iso = new Date().toISOString();
const ses = sq.prepare(`INSERT INTO practice_sessions (id,profile_id,course_id,subject_id,topic_id,total,correct,duration_s,finished_at,kind) VALUES (?,?,?,?,?,8,6,60,?, 'practice')`);
ses.run('s1', 'alex', '4-primaria', 'mates', 'tablas', iso); ses.run('s2', 'alex', '4-primaria', 'mates', 'numeros', iso); ses.run('l1', 'lucia', '4-primaria', 'mates', 'tablas', iso);
const ins = sq.prepare(`INSERT INTO answers (id,session_id,question_id,is_correct,given) VALUES (?,?,?,?,?)`);
for (let i = 0; i < 1300; i++) ins.run('a' + i, i % 2 ? 's1' : 's2', 'q' + (i % 8), i % 2, 'x');
sq.prepare(`INSERT INTO study_progress (id,profile_id,course_id,subject_id,topic_id,completed_at) VALUES ('st1','alex','4-primaria','mates','tablas',?)`).run(iso);
sq.prepare(`INSERT INTO topic_release (id,profile_id,course_id,subject_id,topic_id) VALUES ('r1','alex','4-primaria','mates','tablas')`).run();
sq.prepare(`INSERT INTO reto_diario (id,profile_id,course_id,day,questions) VALUES ('rd1','alex','4-primaria','2026-10-28','[]')`).run();
const server = http.createServer(async (req, res) => { const chunks = []; for await (const c of req) chunks.push(c); const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const r = await worker.fetch(new Request(`${API}${req.url}`, { method: req.method, headers: req.headers, body: ['GET','HEAD'].includes(req.method) ? undefined : body }), env);
  res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer())); }).listen(8794);
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };
const browser = await chromium.launch(); const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'es-ES' });
await ctx.addInitScript(`localStorage.setItem('aj.apiUrl','${API}'); localStorage.setItem('aj.apiKey','k'); sessionStorage.setItem('aj.parentsUnlockedUntil', String(Date.now()+600000));
  navigator.canShare = () => true; window.__shared = null; navigator.share = async ({ files }) => { window.__shared = await files[0].text(); };`);
const page = await ctx.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
const open = async () => { await page.goto(B + '#/parents'); await page.reload(); await page.waitForSelector('.backup-card'); };
const pick = async (path) => page.setInputFiles('input[type=file]', path);
const modalText = async () => { await page.waitForSelector('.modal'); return page.textContent('.modal'); };
const clickModal = (label) => page.click(`.modal button:has-text("${label}")`);
const before = { profiles: count('profiles'), ses: count('practice_sessions'), ans: count('answers'), st: count('study_progress'), rel: count('topic_release'), reto: count('reto_diario') };
// 1. hacer la copia
await open(); await page.click('.backup-card button'); await page.waitForTimeout(2000);
const json = await page.evaluate(() => window.__shared); fs.writeFileSync('/tmp/copia-test.json', json); assert.ok(json.length > 1000); ok('copia hecha y guardada en un archivo de prueba');
// 2. borrar el perfil de Alex (borra todo su progreso en cascada) y cambiar algo de Lucía después de la copia
await page.evaluate(async (api) => { await fetch(`${api}/api/profiles/alex`, { method: 'DELETE', headers: { 'X-Api-Key': 'k' } }); }, API);
sq.prepare(`UPDATE practice_sessions SET correct=1 WHERE id='l1'`).run();
assert.equal(count('profiles', "id='alex'"), 0); assert.equal(count('answers'), 0); ok('perfil borrado: se pierde su progreso (cascada)');
// 3. archivos que no valen: no cambian nada
await open(); fs.writeFileSync('/tmp/otro.json', JSON.stringify({ hola: 1 })); await pick('/tmp/otro.json'); await page.waitForTimeout(500);
assert.match(await page.textContent('.backup-card:has(input[type=file])'), /no es una copia de esta app/); assert.equal(count('profiles'), 1); ok('un JSON de otra cosa se rechaza con mensaje claro');
fs.writeFileSync('/tmp/roto.json', 'esto no es json {'); await pick('/tmp/roto.json'); await page.waitForTimeout(500);
assert.match(await page.textContent('.backup-card:has(input[type=file])'), /no es una copia válida/); assert.equal(count('profiles'), 1); ok('un archivo estropeado se rechaza');
const dañado = JSON.parse(json); delete dañado.tables.answers; fs.writeFileSync('/tmp/danado.json', JSON.stringify(dañado)); await pick('/tmp/danado.json'); await page.waitForTimeout(500);
assert.match(await page.textContent('.backup-card:has(input[type=file])'), /incompleta o estropeada \(answers\)/); ok('una copia a la que le falta una tabla se rechaza');
// 4. cancelar: no importa nada
await pick('/tmp/copia-test.json'); const txt = await modalText(); assert.match(txt, /Perfiles: 2/); assert.match(txt, /Respuestas: 1300/); assert.match(txt, /no se borra ni se cambia nada/); ok('antes de importar enseña el resumen: Perfiles: 2 · … Respuestas: 1300');
await page.screenshot({ path: 'shots/restore-confirm.png' });
await clickModal('Cancelar'); await page.waitForTimeout(500); assert.equal(count('profiles'), 1); assert.equal(count('answers'), 0); ok('cancelar no importa nada');
// 5. importar
await pick('/tmp/copia-test.json'); await modalText(); await clickModal('Recuperar'); const done = await modalText(); assert.match(done, /Copia recuperada/); assert.match(done, /13\d\d datos/);
await Promise.all([page.waitForEvent('load'), clickModal('Entendido')]); await page.waitForSelector('.backup-card');
const after = { profiles: count('profiles'), ses: count('practice_sessions'), ans: count('answers'), st: count('study_progress'), rel: count('topic_release'), reto: count('reto_diario') };
assert.deepEqual(after, before); ok('todo vuelve: perfiles, sesiones, 1.300 respuestas, estudiados, liberados y retos');
assert.equal(sq.prepare(`SELECT correct FROM practice_sessions WHERE id='l1'`).get().correct, 1); ok('lo que ya existía no se pisa (la sesión de Lucía cambiada después de la copia se queda como está)');
assert.equal(sq.prepare(`SELECT value FROM settings WHERE key='parent_pin'`).get().value, 'SECRETO-HASH'); ok('el PIN no se toca');
// 6. importar otra vez: no duplica
await pick('/tmp/copia-test.json'); await modalText(); await clickModal('Recuperar'); const again = await modalText(); assert.match(again, /Ya estaba todo/);
await Promise.all([page.waitForEvent('load'), clickModal('Entendido')]); await page.waitForSelector('.backup-card');
assert.equal(count('answers'), 1300); assert.equal(count('profiles'), 2); ok('importar dos veces no duplica nada: "Ya estaba todo"');
await page.screenshot({ path: 'shots/restore-card.png' });
assert.deepEqual(errors, []); ok('sin errores'); console.log(n, 'comprobaciones');
await browser.close(); server.close(); process.exit(0);
