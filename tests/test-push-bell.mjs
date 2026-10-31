import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequire } from 'node:module';
import { createDecipheriv, createECDH, hkdfSync, webcrypto } from 'node:crypto';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';
const { chromium } = createRequire(import.meta.url)('playwright');

const PORT_API = 8791, BASE = 'http://localhost:8761/';
const API = `http://localhost:${PORT_API}`;
const b64 = (buf) => Buffer.from(buf).toString('base64url');

// Claves VAPID de prueba (las del Worker) y "el móvil" (las que descifran)
const kp = await webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const vPub = b64(await webcrypto.subtle.exportKey('raw', kp.publicKey)); const vPriv = (await webcrypto.subtle.exportKey('jwk', kp.privateKey)).d;
const ua = createECDH('prime256v1'); ua.generateKeys(); const uaPub = b64(ua.getPublicKey()); const uaAuth = b64(webcrypto.getRandomValues(new Uint8Array(16)));
function decrypt(body) {
  const salt = body.subarray(0, 16); const idlen = body[20]; const asPub = body.subarray(21, 21 + idlen); const cipher = body.subarray(21 + idlen);
  const shared = ua.computeSecret(asPub);
  const ikm = hkdfSync('sha256', shared, Buffer.from(uaAuth, 'base64url'), Buffer.concat([Buffer.from('WebPush: info\0'), ua.getPublicKey(), asPub]), 32);
  const cek = hkdfSync('sha256', Buffer.from(ikm), salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16);
  const nonce = hkdfSync('sha256', Buffer.from(ikm), salt, Buffer.from('Content-Encoding: nonce\0'), 12);
  const d = createDecipheriv('aes-128-gcm', Buffer.from(cek), Buffer.from(nonce)); d.setAuthTag(cipher.subarray(-16));
  const plain = Buffer.concat([d.update(cipher.subarray(0, -16)), d.final()]);
  return JSON.parse(plain.subarray(0, plain.lastIndexOf(2)).toString());
}

// API de prueba (el Worker real) + servicio de avisos de mentira en el mismo servidor
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname);
const env = { DB: db, API_KEY: 'k', VAPID_PUBLIC_KEY: vPub, VAPID_PRIVATE_KEY: vPriv, VAPID_SUBJECT: 'https://yo.github.io/app/' };
db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color) VALUES ('alex','Alex','#FFC53D'),('lucia','Lucía','#8EDBC0')`);
const received = []; let pushStatus = 201;
const server = http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c); const body = chunks.length ? Buffer.concat(chunks) : undefined;
  if (req.url.startsWith('/push-service/')) { received.push({ url: req.url, auth: req.headers.authorization, message: pushStatus === 201 ? decrypt(body) : null }); res.writeHead(pushStatus); return res.end(); }
  const response = await worker.fetch(new Request(`${API}${req.url}`, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body }), env);
  res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(Buffer.from(await response.arrayBuffer()));
}).listen(PORT_API);

// El "móvil": permiso y suscripción de mentira (el resto del navegador es real, incluido el service worker)
const fakePush = `
  (() => {
    const get = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } };
    Object.defineProperty(Notification, 'permission', { get: () => get('fake-perm', 'default') });
    Notification.requestPermission = async () => { const a = get('fake-answer', 'granted'); localStorage.setItem('fake-perm', a); return a; };
    const make = () => ({ endpoint: '${API}/push-service/movil1', toJSON() { return { endpoint: this.endpoint, keys: { p256dh: '${uaPub}', auth: '${uaAuth}' } }; }, unsubscribe: async () => true });
    PushManager.prototype.getSubscription = async () => (get('fake-sub') ? make() : null);
    PushManager.prototype.subscribe = async (opts) => { window.__subscribeOpts = { userVisible: opts.userVisibleOnly, keyLen: opts.applicationServerKey.length, key: Array.from(opts.applicationServerKey) }; localStorage.setItem('fake-sub', '1'); return make(); };
  })();
`;
const setup = `localStorage.setItem('aj.apiUrl', '${API}'); localStorage.setItem('aj.apiKey', 'k');`;

let steps = 0; const ok = (n) => { steps++; console.log('  ✓', n); };
const browser = await chromium.launch();
async function newPage({ ua: userAgent, standalone, noPush } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'es-ES', ...(userAgent ? { userAgent } : {}) });
  await ctx.addInitScript(setup);
  if (!noPush) await ctx.addInitScript(fakePush);
  if (noPush) await ctx.addInitScript('delete window.PushManager;');
  if (standalone === false) await ctx.addInitScript("Object.defineProperty(navigator, 'standalone', { get: () => false });");
  const page = await ctx.newPage(); const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text())); page.on('pageerror', (e) => errors.push(String(e)));
  return { ctx, page, errors };
}
const rows = () => db.sqlite.prepare('SELECT * FROM push_devices ORDER BY id').all();
const toggle = (page) => page.locator('.switch-row .switch');
const settle = async (page) => { await page.waitForSelector('.switch-row'); await page.waitForFunction(() => !document.querySelector('.switch-row .switch')?.disabled || document.querySelector('.switch-row__meta')?.textContent.length > 60, null, { timeout: 8000 }).catch(() => {}); await page.waitForTimeout(150); };

// 1) Móvil normal
{
  const { ctx, page, errors } = await newPage();
  await page.goto(BASE + '#/p/alex/edit'); await settle(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  assert.equal(await page.locator('.switch-row').count(), 1);
  assert.match(await page.locator('.switch-row__title').innerText(), /Avisos del reto/);
  assert.equal(await toggle(page).getAttribute('aria-checked'), 'false'); assert.equal(await toggle(page).isDisabled(), false); ok('edición de perfil: aparece la campanita, apagada y lista para usar');
  await page.screenshot({ path: 'shots/bell-off.png' });

  await toggle(page).click(); await page.waitForFunction(() => document.querySelector('.switch-row .switch').getAttribute('aria-checked') === 'true'); await page.waitForTimeout(600);
  const opts = await page.evaluate(() => window.__subscribeOpts);
  assert.equal(opts.userVisible, true); assert.equal(opts.keyLen, 65); assert.equal(opts.key[0], 4); assert.equal(b64(Uint8Array.from(opts.key)), 'BHaapmRJeImDdJ2WyIeOl3JXh2VB1U9GWm5STuldUVXsdjrypURUE7lZ31OkHgu6hXDSoImwmzxtG0f2Mq8skGQ'); ok('al activar: pide permiso y se suscribe con la clave pública de los avisos');
  const r = rows(); assert.equal(r.length, 1); assert.equal(r[0].kind, 'child'); assert.equal(r[0].profile_id, 'alex'); assert.equal(r[0].p256dh, uaPub); assert.equal(r[0].auth, uaAuth); assert.match(r[0].id, /^child-alex-[0-9a-f]{24}$/); ok('se guarda el móvil en push_devices como "child" de Alex');
  assert.equal(received.length, 1); assert.match(received[0].auth, /^vapid t=.+, k=/); assert.deepEqual(received[0].message, { title: 'Avisos activados', body: 'Recibirás un recordatorio si Alex no ha hecho el reto del día.', tag: 'avisos-activados' }); ok('llega el aviso de bienvenida, cifrado y firmado, con el texto correcto');
  await page.screenshot({ path: 'shots/bell-on.png' });

  await page.reload(); await settle(page); assert.equal(await toggle(page).getAttribute('aria-checked'), 'true'); ok('al volver a abrir la pantalla la campanita sigue activada');

  await toggle(page).click(); await page.waitForFunction(() => document.querySelector('.switch-row .switch').getAttribute('aria-checked') === 'false'); await page.waitForTimeout(300);
  assert.equal(rows().length, 0); assert.equal(await page.evaluate(() => localStorage.getItem('fake-sub')), '1'); ok('al desactivar: se borra el móvil de ese perfil');
  await page.reload(); await settle(page); assert.equal(await toggle(page).getAttribute('aria-checked'), 'false'); ok('y sigue desactivada al recargar');

  // Reactivar no duplica
  await toggle(page).click(); await page.waitForFunction(() => document.querySelector('.switch-row .switch').getAttribute('aria-checked') === 'true'); await page.waitForTimeout(400);
  assert.equal(rows().length, 1); ok('volver a activar no duplica filas');

  // Otro perfil en el mismo móvil
  await page.goto(BASE + '#/p/lucia/edit'); await settle(page);
  assert.equal(await toggle(page).getAttribute('aria-checked'), 'false'); ok('otro perfil en el mismo móvil empieza apagado');
  await toggle(page).click(); await page.waitForFunction(() => document.querySelector('.switch-row .switch').getAttribute('aria-checked') === 'true'); await page.waitForTimeout(400);
  const two = rows(); assert.equal(two.length, 2); assert.equal(new Set(two.map((x) => x.endpoint)).size, 1); assert.deepEqual(two.map((x) => x.profile_id).sort(), ['alex', 'lucia']); ok('el mismo móvil recibe avisos de dos perfiles (dos filas, un móvil)');
  assert.equal(received.at(-1).message.body, 'Recibirás un recordatorio si Lucía no ha hecho el reto del día.'); ok('el aviso de Lucía lleva su nombre');
  await page.goto(BASE + '#/p/alex/edit'); await settle(page); await toggle(page).click(); await page.waitForTimeout(500);
  assert.deepEqual(rows().map((x) => x.profile_id), ['lucia']); ok('apagar Alex no toca los avisos de Lucía');
  assert.deepEqual(errors.filter((e) => !/Failed to load resource/.test(e)), []); ok('sin errores en consola');
  await ctx.close();
}

// 2) Permiso denegado
{
  const { ctx, page } = await newPage(); await page.addInitScript("localStorage.setItem('fake-answer', 'denied')");
  db.sqlite.exec('DELETE FROM push_devices'); received.length = 0;
  await page.goto(BASE + '#/p/alex/edit'); await settle(page); await toggle(page).click();
  await page.waitForSelector('.modal'); assert.match(await page.locator('.modal').innerText(), /Avisos bloqueados/); assert.match(await page.locator('.modal').innerText(), /Ajustes/);
  await page.locator('.modal button').first().click(); await page.waitForTimeout(200);
  assert.equal(await toggle(page).getAttribute('aria-checked'), 'false'); assert.equal(rows().length, 0); assert.equal(received.length, 0); ok('permiso denegado: aviso claro, la campanita vuelve a apagarse y no se guarda nada');
  await page.screenshot({ path: 'shots/bell-denied.png' }); await ctx.close();
}

// 3) El Worker falla al enviar el aviso de bienvenida: se activa igual y se avisa
{
  const { ctx, page } = await newPage(); pushStatus = 500; received.length = 0;
  await page.goto(BASE + '#/p/alex/edit'); await settle(page); await toggle(page).click();
  await page.waitForSelector('.modal'); assert.match(await page.locator('.modal').innerText(), /no se ha podido enviar el aviso de prueba/);
  assert.equal(rows().length, 1); assert.equal(await toggle(page).getAttribute('aria-checked'), 'true'); pushStatus = 201; ok('si falla el aviso de prueba: queda activada y se explica'); await ctx.close();
}

// 4) Sin conexión con el Worker al activar
{
  const { ctx, page } = await newPage(); db.sqlite.exec('DELETE FROM push_devices'); received.length = 0;
  await page.goto(BASE + '#/p/alex/edit'); await settle(page);
  await page.route(`${API}/api/push_devices*`, (route) => route.abort()); await toggle(page).click();
  await page.waitForSelector('.modal'); assert.match(await page.locator('.modal').innerText(), /No se pudo guardar/);
  await page.locator('.modal button').first().click(); await page.waitForTimeout(200);
  assert.equal(await toggle(page).getAttribute('aria-checked'), 'false'); ok('sin conexión al activar: error claro y la campanita vuelve a apagarse'); await ctx.close();
}

// 5) iPhone con la app sin instalar (Safari) y navegador sin avisos
{
  const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
  const { ctx, page } = await newPage({ ua: iphone, standalone: false }); await page.goto(BASE + '#/p/alex/edit'); await page.waitForSelector('.switch-row'); await page.waitForTimeout(300);
  assert.equal(await toggle(page).isDisabled(), true); assert.match(await page.locator('.switch-row__meta').innerText(), /instala la app/); ok('iPhone sin instalar: la campanita está desactivada y explica que hay que instalar la app');
  await page.screenshot({ path: 'shots/bell-install.png' }); await ctx.close();
  const b = await newPage({ noPush: true }); await b.page.goto(BASE + '#/p/alex/edit'); await b.page.waitForSelector('.switch-row'); await b.page.waitForTimeout(300);
  assert.equal(await toggle(b.page).isDisabled(), true); assert.match(await b.page.locator('.switch-row__meta').innerText(), /no puede recibir avisos/); ok('navegador sin avisos: desactivada con un texto claro'); await b.ctx.close();
}

// 6) Las pantallas que no son la edición no cambian
{
  const { ctx, page } = await newPage(); await page.goto(BASE + '#/new-profile'); await page.waitForSelector('form');
  assert.equal(await page.locator('.switch-row').count(), 0); ok('crear perfil nuevo no muestra campanita'); await ctx.close();
}
await browser.close(); server.close();
console.log('\n' + steps + ' comprobaciones OK');
process.exit(0);
