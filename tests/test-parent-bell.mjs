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

db.sqlite.exec("INSERT INTO topic_release (id, profile_id, course_id, subject_id, topic_id) VALUES ('r1','alex','4-primaria','mates','tablas')");
const unlockKey = "sessionStorage.setItem('aj.parentsUnlockedUntil', String(Date.now() + 600000));";
{
  const { ctx, page, errors } = await newPage(); await ctx.addInitScript(unlockKey);
  await page.goto(BASE + '#/parents'); await settle(page); await page.evaluate(() => navigator.serviceWorker.ready);
  assert.match(await page.locator('.switch-row__title').innerText(), /Avisos para padres/); assert.equal(await toggle(page).getAttribute('aria-checked'), 'false'); ok('zona de padres: campanita apagada y lista');
  await page.screenshot({ path: 'shots/parents-bell-off.png' });
  await toggle(page).click(); await page.waitForFunction(() => document.querySelector('.switch-row .switch').getAttribute('aria-checked') === 'true'); await page.waitForTimeout(600);
  const r = rows(); assert.equal(r.length, 1); assert.equal(r[0].kind, 'parent'); assert.match(r[0].id, /^parent-padres-[0-9a-f]{24}$/); ok('se guarda el móvil como "parent"');
  assert.deepEqual(received.at(-1).message, { title: 'Avisos activados', body: 'Recibirás un aviso cuando un perfil termine un reto, un estudio o ejercicios.', tag: 'avisos-padres-activados' }); ok('llega el aviso de bienvenida de padres');
  await page.screenshot({ path: 'shots/parents-bell-on.png' });
  await page.reload(); await settle(page); assert.equal(await toggle(page).getAttribute('aria-checked'), 'true'); ok('sigue activada al recargar');

  // Alex marca un tema como estudiado → llega a los padres (descifrado de verdad)
  received.length = 0;
  await page.goto(BASE + '#/p/alex/c/4-primaria/s/mates/study/tablas'); await page.waitForSelector('.lesson__actions button');
  await page.locator('.lesson__actions button').first().click(); await page.waitForTimeout(1200);
  assert.equal(received.length, 1); assert.deepEqual(received[0].message, { title: 'Alex ha estudiado', body: 'Matemáticas · Tablas de multiplicar · +10 puntos', url: '#/parents' }); ok('de extremo a extremo: Alex estudia y el móvil de padres recibe el aviso cifrado');

  await page.locator('.celebration__button').click();
  // Apagar la campanita: ya no llega nada
  await page.goto(BASE + '#/parents'); await settle(page); await toggle(page).click(); await page.waitForTimeout(500); assert.equal(rows().length, 0);
  received.length = 0; await page.goto(BASE + '#/p/alex/c/4-primaria/s/mates/practice/tablas'); await page.waitForSelector('.question__prompt', { timeout: 5000 }).catch(() => {});
  assert.equal(received.length, 0); ok('con la campanita apagada no llega nada');
  assert.deepEqual(errors.filter((e) => !/Failed to load resource/.test(e)), []); ok('sin errores en consola');
  await ctx.close();
}
await browser.close(); server.close();
console.log('\n' + steps + ' comprobaciones OK');
process.exit(0);
