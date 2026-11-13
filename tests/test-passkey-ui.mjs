import assert from 'node:assert/strict';
import nodeCrypto from 'node:crypto';
import { JSDOM } from 'jsdom';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';

// Face ID en las pantallas: activar desde Padres y entrar con la cara, con un autenticador simulado y el Worker real.
const ORIGIN = 'https://yo.github.io';
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: `${ORIGIN}/aprende/`, pretendToBeVisual: true });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, location: window.location, localStorage: window.localStorage, sessionStorage: window.sessionStorage });
window.scrollTo = () => {};
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname);
const env = { DB: db, API_KEY: 'k', ALLOWED_ORIGIN: ORIGIN, TELEGRAM_BOT_TOKEN: '', TELEGRAM_CHAT_ID: '' };
globalThis.fetch = async (url, init = {}) => worker.fetch(new Request(url, init), env);
console.error = () => {};

// Autenticador simulado
const keys = nodeCrypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const rawId = nodeCrypto.randomBytes(32);
const authData = () => Buffer.concat([nodeCrypto.createHash('sha256').update('yo.github.io').digest(), Buffer.from([0x45]), Buffer.alloc(4)]);
let cancel = false;
const clientData = (type, challenge) => Buffer.from(JSON.stringify({ type, challenge: Buffer.from(challenge).toString('base64url'), origin: ORIGIN }));
const credentials = {
  async create({ publicKey }) {
    if (cancel) throw Object.assign(new Error('x'), { name: 'NotAllowedError' });
    return { rawId, response: { clientDataJSON: clientData('webauthn.create', publicKey.challenge), getPublicKey: () => keys.publicKey.export({ type: 'spki', format: 'der' }), getAuthenticatorData: () => authData() } };
  },
  async get({ publicKey }) {
    if (cancel) throw Object.assign(new Error('x'), { name: 'NotAllowedError' });
    assert.equal(publicKey.allowCredentials.length, 1); assert.equal(publicKey.userVerification, 'required');
    const cd = clientData('webauthn.get', publicKey.challenge); const ad = authData();
    const signature = nodeCrypto.sign('sha256', Buffer.concat([ad, nodeCrypto.createHash('sha256').update(cd).digest()]), { key: keys.privateKey, dsaEncoding: 'der' });
    return { rawId, response: { clientDataJSON: cd, authenticatorData: ad, signature } };
  },
};
Object.defineProperty(window.navigator, 'credentials', { value: credentials, configurable: true });
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
window.PublicKeyCredential = function PublicKeyCredential() {};

const { reload } = await import('../js/core/router.js');
const { setConnection } = await import('../js/core/api.js');
const { resetFlags } = await import('../js/features/auth/flags.js');
const { getSession, clearSession, setSession } = await import('../js/core/api/session-store.js');
setConnection('https://w.example', 'k');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const app = () => document.getElementById('app');
const text = () => app().textContent;
const q = (s) => app().querySelector(s);
async function settle() { await sleep(30); for (let i = 0; i < 300; i++) { if (!q('.spinner')) { await sleep(20); if (!q('.spinner')) return; } await sleep(10); } throw new Error('cargando…'); }
async function visit(hash) { if (location.hash === hash) reload(); else location.hash = hash; await settle(); await sleep(60); await settle(); }
const button = (re) => [...document.querySelectorAll('button')].find((b) => re.test(b.textContent));
await import('../js/main.js'); await settle();
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };

const res = await worker.fetch(new Request('https://w.example/auth/setup', { method: 'POST', headers: { 'X-Api-Key': 'k', 'Content-Type': 'application/json' }, body: JSON.stringify({ owner: 'parent', code: '739201' }) }), env);
setSession('parent', (await res.json()).token);

await visit('#/parents'); 
assert.ok([...app().querySelectorAll('a')].some((a) => a.getAttribute('href') === '#/parents/face-id')); ok('Padres tiene el acceso a Face ID');
await visit('#/parents/face-id'); assert.match(text(), /Todavía no hay ningún móvil/); assert.ok(button(/Activar Face ID/)); ok('pantalla de Face ID: sin móviles todavía');
cancel = true; button(/Activar Face ID/).click(); await sleep(200);
assert.equal(db.sqlite.prepare('SELECT COUNT(*) c FROM passkeys').get().c, 0); assert.equal(q('.field__error').textContent, ''); ok('cancelar Face ID no registra nada ni da error');
cancel = false; document.getElementById('faceid-label').value = 'iPhone de Israel';
button(/Activar Face ID/).click(); await sleep(300);
assert.ok(button(/Entendido/)); button(/Entendido/).click(); await sleep(300); await settle();
assert.equal(db.sqlite.prepare('SELECT label FROM passkeys').get().label, 'iPhone de Israel'); assert.match(text(), /iPhone de Israel/);
assert.ok(q('form, .stack[hidden]') || [...app().querySelectorAll('[hidden]')].length > 0); assert.ok(button(/Añadir otro móvil/)); assert.match(text(), /Último uso: nunca/); ok('activar Face ID: queda registrado, aparece en la lista y el formulario se oculta tras «Añadir otro móvil»');
button(/Añadir otro móvil/).click(); assert.equal(document.getElementById('faceid-label').closest('[hidden]'), null); ok('«Añadir otro móvil» enseña de nuevo el formulario');

clearSession('parent'); resetFlags();
await visit('#/login/parent');
const faceBtn = button(/Entrar con Face ID/); assert.ok(faceBtn); ok('el acceso de padres ofrece «Entrar con Face ID» en este móvil');
cancel = true; faceBtn.click(); await sleep(200); assert.ok(!getSession('parent')); assert.equal(location.hash, '#/login/parent'); ok('cancelar Face ID deja el código como está');
cancel = false; button(/Entrar con Face ID/).click(); await sleep(400); await settle();
assert.ok(getSession('parent')); assert.equal(location.hash, '#/parents'); ok('Face ID entra a la zona de padres');

// El código bloqueado no impide Face ID
clearSession('parent'); resetFlags();
for (let i = 0; i < 5; i++) await worker.fetch(new Request('https://w.example/auth/login', { method: 'POST', headers: { 'X-Api-Key': 'k', 'Content-Type': 'application/json' }, body: JSON.stringify({ owner: 'parent', code: '000000' }) }), env);
await visit('#/login/parent'); button(/Entrar con Face ID/).click(); await sleep(400); await settle();
assert.equal(location.hash, '#/parents'); ok('con el código bloqueado, Face ID sigue entrando');

// Quitar el móvil
await visit('#/parents/face-id'); button(/Quitar/).click(); await sleep(100);;
const confirmBtn = [...document.querySelectorAll('button')].filter((b) => /Quitar/.test(b.textContent)).pop(); confirmBtn.click(); await sleep(400); await settle();
assert.equal(db.sqlite.prepare('SELECT COUNT(*) c FROM passkeys').get().c, 0); assert.equal(localStorage.getItem('aj.passkey.here'), null); ok('quitar el móvil borra su Face ID');
clearSession('parent'); resetFlags(); await visit('#/login/parent'); assert.equal(button(/Entrar con Face ID/), undefined); ok('sin Face ID activado no sale el botón');
console.log(`\n${n} comprobaciones OK`);
process.exit(0);
