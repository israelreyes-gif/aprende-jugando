// Face ID (passkeys): registro y entrada con un autenticador simulado (claves P-256 reales, firma en DER como el iPhone).
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';

const ORIGIN = 'https://israelreyes-gif.github.io';
const RP = 'israelreyes-gif.github.io';
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname);
const env = { DB: db, API_KEY: 'k', ALLOWED_ORIGIN: ORIGIN, VAPID_PUBLIC_KEY: 'x', VAPID_PRIVATE_KEY: 'x', VAPID_SUBJECT: 'mailto:a@b.c' };
const sql = (t, ...a) => db.sqlite.prepare(t).run(...a); const one = (t, ...a) => db.sqlite.prepare(t).get(...a);
const b64 = (buf) => Buffer.from(buf).toString('base64url');
async function call(path, body = {}, session) {
  const headers = { 'X-Api-Key': 'k', 'Content-Type': 'application/json', ...(session ? { 'X-Session': session } : {}) };
  const res = await worker.fetch(new Request(`https://w.example/auth/${path}`, { method: 'POST', headers, body: JSON.stringify(body) }), env, { waitUntil() {} });
  const t = await res.text(); return { status: res.status, data: t ? JSON.parse(t) : null };
}
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };

// Padres con código: sesión
const parent = (await call('setup', { owner: 'parent', code: '123456' })).data.token;

// Autenticador simulado
const keys = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const spki = b64(keys.publicKey.export({ type: 'spki', format: 'der' }));
const credId = b64(crypto.randomBytes(32));
const authData = (flags = 0x05, rp = RP) => Buffer.concat([crypto.createHash('sha256').update(rp).digest(), Buffer.from([flags]), Buffer.alloc(4)]);
const clientData = (type, challenge, origin = ORIGIN) => Buffer.from(JSON.stringify({ type, challenge, origin }));
function register(challenge, o = {}) {
  return { id: credId, challenge, publicKey: spki, label: 'iPhone de Israel', clientDataJSON: b64(clientData(o.type || 'webauthn.create', challenge, o.origin)), authenticatorData: b64(authData(o.flags ?? 0x45, o.rp)) };
}
function assertion(challenge, o = {}) {
  const ad = authData(o.flags ?? 0x05, o.rp); const cd = clientData(o.type || 'webauthn.get', challenge, o.origin);
  const signed = Buffer.concat([ad, crypto.createHash('sha256').update(cd).digest()]);
  const signature = crypto.sign('sha256', signed, { key: o.key || keys.privateKey, dsaEncoding: 'der' });
  return { id: o.id || credId, challenge, clientDataJSON: b64(cd), authenticatorData: b64(ad), signature: b64(signature) };
}
const challenge = async (kind, session) => (await call('passkey-challenge', { kind }, session)).data?.challenge;

// Registro: solo con sesión de padres
assert.equal((await call('passkey-challenge', { kind: 'register' })).status, 401); ok('sin sesión de padres no se pide reto de registro');
let ch = await challenge('register', parent);
assert.equal((await call('passkey-register', register(ch))).status, 401);
assert.equal((await call('passkey-register', register(await challenge('register', parent), { origin: 'https://malo.example' }), parent)).status, 401); ok('origen distinto: rechazado');
assert.equal((await call('passkey-register', register(await challenge('register', parent), { rp: 'otro.example' }), parent)).status, 401); ok('dominio (rpId) distinto: rechazado');
assert.equal((await call('passkey-register', register(await challenge('register', parent), { flags: 0x01 }), parent)).status, 401); ok('sin verificación de usuario (Face ID): rechazado');
assert.equal((await call('passkey-register', register(await challenge('register', parent), { type: 'webauthn.get' }), parent)).status, 401);
ch = await challenge('register', parent);
assert.equal((await call('passkey-register', register(ch), parent)).status, 201); ok('registro correcto con sesión de padres');
assert.equal((await call('passkey-register', register(ch), parent)).status, 401); ok('un reto no se puede usar dos veces');
assert.equal(one('SELECT COUNT(*) c FROM passkeys').c, 1);
assert.equal((await call('passkey-list', {}, parent)).data.length, 1); assert.equal((await call('passkey-list', {})).status, 401);

// Entrada
const login = await call('passkey-challenge', { kind: 'login' });
assert.deepEqual(login.data.allow, [credId]); assert.equal(login.data.rpId, RP);
let res = await call('passkey-login', assertion(login.data.challenge));
assert.equal(res.status, 200); assert.ok(res.data.token.length >= 32);
assert.equal((await call('passkey-list', {}, res.data.token)).status, 200); ok('entrar con la passkey da sesión de padres');
assert.equal((await call('passkey-login', assertion(login.data.challenge))).status, 401); ok('repetir la misma entrada (reutilizar el reto) falla');
for (const [name, opt] of [['firma de otra clave', { key: crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' }).privateKey }], ['origen falso', { origin: 'https://malo.example' }], ['dominio falso', { rp: 'otro.example' }], ['sin Face ID (flag UV)', { flags: 0x01 }], ['tipo create en vez de get', { type: 'webauthn.create' }], ['passkey desconocida', { id: b64(crypto.randomBytes(32)) }]]) {
  const c = await challenge('login');
  assert.equal((await call('passkey-login', assertion(c, opt))).status, 401, name);
}
ok('firmas ajenas, origen/dominio falsos, sin Face ID, tipo equivocado o passkey desconocida: rechazadas');
const stale = await challenge('login'); sql('UPDATE passkey_challenges SET created_at = created_at - 400000');
assert.equal((await call('passkey-login', assertion(stale))).status, 401); ok('un reto caducado (5 min) no vale');
assert.equal((await call('passkey-login', assertion('inventado'))).status, 401);

// Bloqueo del código: la passkey sigue entrando
for (let i = 0; i < 5; i += 1) await call('login', { owner: 'parent', code: '000000' });
assert.equal((await call('login', { owner: 'parent', code: '123456' })).status, 423);
const lockedLogin = await call('passkey-challenge', { kind: 'login' });
assert.equal((await call('passkey-login', assertion(lockedLogin.data.challenge))).status, 200); ok('con el código bloqueado, Face ID sigue entrando');
assert.equal(one("SELECT fails FROM credentials WHERE owner = 'parent'").fails >= 0, true);

// Borrar
assert.equal((await call('passkey-delete', { id: credId })).status, 401);
assert.equal((await call('passkey-delete', { id: credId }, parent)).status, 200);
const after = await call('passkey-challenge', { kind: 'login' });
assert.equal((await call('passkey-login', assertion(after.data.challenge))).status, 401); ok('al borrar la passkey, ya no entra');

// Sin origen configurado no funciona (no se adivina el dominio)
env.ALLOWED_ORIGIN = '*';
assert.equal((await call('passkey-challenge', { kind: 'login' })).status, 500); env.ALLOWED_ORIGIN = ORIGIN; ok('sin un origen concreto configurado, Face ID no se activa');
console.log(`\n${n} comprobaciones OK`);
