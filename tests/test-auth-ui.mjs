import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';

// Pantallas de acceso con el Worker real (sin atajos de sesión): crear código, entrar, caducar, bloqueo y padres.
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'https://yo.github.io/aprende/', pretendToBeVisual: true });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, location: window.location, localStorage: window.localStorage, sessionStorage: window.sessionStorage });
window.scrollTo = () => {};
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname);
const env = { DB: db, API_KEY: 'k', TELEGRAM_BOT_TOKEN: '', TELEGRAM_CHAT_ID: '' };
globalThis.fetch = async (url, init = {}) => worker.fetch(new Request(url, init), env);
console.error = () => {};
db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color,gender,course_id) VALUES ('alex','Alex','#8EDBC0','chico','4-primaria'),('lucia','Lucía','#FFB3CC','chica','4-primaria')`);

const { reload } = await import('../js/core/router.js');
const { setConnection } = await import('../js/core/api.js');
const { resetFlags } = await import('../js/features/auth/flags.js');
const { getSession, clearSession } = await import('../js/core/api/session-store.js');
setConnection('https://w.example', 'k');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const app = () => document.getElementById('app');
const text = () => app().textContent;
const q = (s) => app().querySelector(s);
async function settle() { await sleep(30); for (let i = 0; i < 300; i++) { if (!q('.spinner')) { await sleep(20); if (!q('.spinner')) return; } await sleep(10); } throw new Error('cargando…'); }
async function visit(hash) { if (location.hash === hash) reload(); else location.hash = hash; await settle(); await sleep(60); await settle(); }
const type = (id, v) => { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new window.Event('input', { bubbles: true })); };
const submit = async () => { q('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })); await sleep(250); await settle(); };
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };
await import('../js/main.js'); await settle();

// 1. Perfil sin código: Alex lo crea él mismo (dos veces) al intentar entrar
await visit('#/p/alex');
assert.equal(location.hash, '#/login/alex'); assert.match(text(), /Todavía no tienes código/); ok('perfil sin código: se le pide crear uno');
type('login-new', '12'); type('login-repeat', '12'); await submit();
assert.match(q('.field__error').textContent, /entre 4 y 8/); ok('código demasiado corto rechazado');
type('login-new', '4821'); type('login-repeat', '4822'); await submit();
assert.match(q('.field__error').textContent, /no coinciden/); ok('los dos códigos tienen que coincidir');
type('login-repeat', '4821'); await submit();
assert.equal(location.hash, '#/p/alex'); assert.ok(getSession('alex')); ok('crea el código y entra a su tarjeta');
assert.equal(db.sqlite.prepare("SELECT COUNT(*) c FROM credentials WHERE owner='alex'").get().c, 1);
assert.ok(!JSON.stringify(db.sqlite.prepare('SELECT * FROM credentials').all()).includes('4821')); ok('el código se guarda con hash, nunca en claro');

// 2. Con sesión abierta no se vuelve a pedir
resetFlags(); await visit('#/'); await visit('#/p/alex');
assert.equal(location.hash, '#/p/alex'); ok('con sesión abierta no se pide el código otra vez');

// 3. Editar el perfil siempre pide el código; fallos y acierto
await visit('#/p/alex/edit');
assert.equal(location.hash, '#/login/alex/edit'); ok('editar el perfil pide el código aunque haya sesión');
type('login-code', '0000'); await submit();
assert.match(q('.field__error').textContent, /Te quedan 4 intentos/); ok('código incorrecto: dice cuántos intentos quedan');
type('login-code', '4821'); await submit();
assert.equal(location.hash, '#/p/alex/edit'); assert.match(text(), /Pedir el código siempre/); assert.match(text(), /Cambiar mi código/); ok('código correcto: abre la edición con el ajuste "pedir siempre"');

// 4. "Pedir siempre al abrir la tarjeta"
db.sqlite.exec("UPDATE profiles SET ask_always=1 WHERE id='alex'");
await visit('#/'); await visit('#/p/alex');
assert.equal(location.hash, '#/login/alex'); ok('con "pedir siempre" activado, la tarjeta pide el código al abrirla');
type('login-code', '4821'); await submit();
assert.equal(location.hash, '#/p/alex'); ok('lo escribe y entra');

// 5. Bloqueo tras 5 fallos
await visit('#/'); clearSession('alex'); await visit('#/p/alex');
for (let i = 0; i < 5; i++) { type('login-code', '0000'); await submit(); }
assert.match(q('.field__error').textContent, /Demasiados intentos/); ok('5 fallos: bloqueo temporal');
type('login-code', '4821'); await submit();
assert.match(q('.field__error').textContent, /Demasiados intentos/); ok('durante el bloqueo ni el código bueno entra');

// 6. Padres: crean su código (usuario padres), y con su sesión no se pide nada más
await visit('#/parents');
assert.equal(location.hash, '#/login/parent'); assert.equal(document.getElementById('parent-user'), null); ok('zona de padres: pide solo el código, sin campo de usuario');
type('login-new', '1234'); type('login-repeat', '1234'); await submit();
assert.match(q('.field__error').textContent, /entre 6 y 8/); ok('el código de padres necesita 6 cifras como mínimo');
type('login-new', '739201'); type('login-repeat', '739201'); await submit();
assert.equal(location.hash, '#/parents'); assert.match(text(), /Elige un perfil/); ok('crea el código de padres y entra');
await visit('#/p/lucia'); assert.equal(location.hash, '#/p/lucia'); ok('con sesión de padres se abre cualquier perfil sin pedir nada');
await visit('#/p/lucia/edit'); assert.equal(location.hash, '#/p/lucia/edit'); ok('y también su edición');
await visit('#/parents/alex'); assert.match(text(), /Restablecer su código/); ok('padres: botón para restablecer el código de un perfil');

// 6b. Atajo "Entrar como padre" desde la tarjeta de un perfil
clearSession('parent'); resetFlags();
await visit('#/p/lucia'); assert.equal(location.hash, '#/login/lucia');
const link = [...app().querySelectorAll('a')].find((a) => /Entrar como padre/.test(a.textContent)); assert.ok(link); assert.equal(link.getAttribute('href'), '#/login/parent'); ok('el login de un perfil tiene el botón "Entrar como padre"');
await visit('#/login/parent'); type('login-code', '739201'); await submit();
assert.equal(location.hash, '#/p/lucia'); ok('con el código de padres vuelve a la tarjeta que se quería abrir');

// 7. Un perfil sin sesión no ve a otro perfil
clearSession('parent'); resetFlags();
await visit('#/p/lucia'); assert.equal(location.hash, '#/login/lucia'); ok('sin sesión, cada tarjeta pide su código');
console.log(`\n${n} comprobaciones OK`);
