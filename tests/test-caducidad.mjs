// Al caducar la sesión de padres (30 min sin uso) sale un aviso sobre la pantalla; al aceptarlo, o al tocar fuera, se va al código.
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body><div id="app"></div></body>', { url: 'http://localhost/#/parents' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, location: dom.window.location, localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage, HTMLElement: dom.window.HTMLElement, Node: dom.window.Node, Event: dom.window.Event });
window.scrollTo = () => {};
const R = new URL('../js', import.meta.url).pathname;
const tick = (ms = 20) => new Promise((r) => setTimeout(r, ms));
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };
const realNow = Date.now; let offset = 0; Date.now = () => realNow() + offset;

const { setSession, hasSession, PARENT_OWNER } = await import(`${R}/core/api/session-store.js`);
const { checkParentIdle } = await import(`${R}/features/auth/parent-idle-watch.js`);
const { authRedirect } = await import(`${R}/features/auth/auth-guard.js`);
const overlay = () => document.querySelector('.modal-overlay');
const button = () => document.querySelector('.modal-overlay button');

// 1. Sin pasar los 30 minutos no pasa nada
setSession(PARENT_OWNER, 'tok'); offset = 29 * 60 * 1000; checkParentIdle(); await tick();
assert.equal(overlay(), null); assert.equal(hasSession(PARENT_OWNER), true); ok('a los 29 min no hay aviso y la sesión sigue');

// 2. A los 30 min: aviso, sesión cerrada, y la pantalla de debajo no cambia hasta aceptar
offset = 31 * 60 * 1000; checkParentIdle(); await tick();
assert.ok(overlay()); assert.match(overlay().textContent, /Sesión caducada/); assert.match(overlay().textContent, /padres/); assert.equal(hasSession(PARENT_OWNER), false);
assert.equal(location.hash, '#/parents'); ok('a los 31 min sale el aviso, la sesión se cierra y se sigue en la misma pantalla');
checkParentIdle(); await tick(); assert.equal(document.querySelectorAll('.modal-overlay').length, 1); ok('no se apilan avisos');

// 3. Aceptar lleva a la pantalla del código
button().click(); await tick();
assert.equal(overlay(), null); assert.match(location.hash, /^#\/login\/parent/); ok('al pulsar «Introducir código» va a la pantalla de código de padres');
assert.equal(sessionStorage.getItem('aj.next'), '/parents'); ok('y después del código se vuelve a la pantalla en la que estaba');

// 4. Tocar fuera de la ventana (cualquier otro enlace queda tapado) también lleva al código
location.hash = '#/parents'; setSession(PARENT_OWNER, 'tok2'); offset += 31 * 60 * 1000; checkParentIdle(); await tick();
assert.ok(overlay()); overlay().dispatchEvent(new window.MouseEvent('click', { bubbles: true })); await tick();
assert.equal(overlay(), null); assert.match(location.hash, /^#\/login\/parent/); ok('tocar fuera del aviso también lleva al código');

// 5. Fuera de la zona de padres (un niño jugando) no se interrumpe: solo se cierra la sesión
location.hash = '#/p/alex/c/4-primaria'; setSession(PARENT_OWNER, 'tok3'); offset += 31 * 60 * 1000; checkParentIdle(); await tick();
assert.equal(overlay(), null); assert.equal(hasSession(PARENT_OWNER), false); assert.equal(location.hash, '#/p/alex/c/4-primaria'); ok('mientras juega un niño no sale ningún aviso (la sesión de padres se cierra en silencio)');

// 6. Una petición que dice «sesión no válida» con sesión abierta: aviso; sin sesión: redirección normal
location.hash = '#/parents/alex'; const back = authRedirect({ code: 'auth', owner: PARENT_OWNER, expired: true }, '/parents/alex'); await tick();
assert.equal(back, '#/parents/alex'); assert.ok(overlay()); button().click(); await tick(); assert.match(location.hash, /^#\/login\/parent/); ok('una petición rechazada por sesión caducada muestra el aviso y luego lleva al código');
assert.match(authRedirect({ code: 'auth', owner: PARENT_OWNER, expired: false }, '/parents'), /^#\/login\/parent/); assert.equal(overlay(), null); ok('si nunca hubo sesión, va directo al código sin aviso');
console.log(`\n${n} comprobaciones OK`);
