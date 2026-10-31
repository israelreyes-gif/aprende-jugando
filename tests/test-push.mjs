import assert from 'node:assert/strict';
import { createDecipheriv, createECDH, createPublicKey, createVerify, hkdfSync, webcrypto } from 'node:crypto';
import { toBase64Url, fromBase64Url } from '../worker/push-base64url.js';
import { encryptPayload } from '../worker/push-encrypt.js';
import { vapidAuthorization } from '../worker/push-vapid.js';
import { sendPush } from '../worker/push-send-push.js';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';

let passed = 0; const ok = (n) => { passed++; console.log('  ✓', n); };
const subtle = webcrypto.subtle;

// base64url
assert.equal(toBase64Url(Uint8Array.of(251, 255, 254)), '-__-'); assert.deepEqual([...fromBase64Url('-__-')], [251, 255, 254]); ok('base64url ida y vuelta');

// Cifrado: vector oficial del RFC 8291 (apéndice A)
const rfc = {
  plaintext: 'When I grow up, I want to be a watermelon',
  asPrivate: 'yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw',
  asPublic: 'BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8',
  uaPublic: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4',
  uaPrivate: 'q1dXpw3UpT5VOmu_cf_v6ih07Aems3njxI-JWgLcM94',
  auth: 'BTBZMqHH6r4Tts7J_aSIgg', salt: 'DGv6ra1nlYgDCS1FRnbzlw',
  body: 'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN',
};
const pub = fromBase64Url(rfc.asPublic);
const ephemeral = {
  publicKey: await subtle.importKey('raw', pub, { name: 'ECDH', namedCurve: 'P-256' }, true, []),
  privateKey: await subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x: toBase64Url(pub.slice(1, 33)), y: toBase64Url(pub.slice(33)), d: rfc.asPrivate, ext: true }, { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']),
};
const got = await encryptPayload({ p256dh: rfc.uaPublic, auth: rfc.auth }, rfc.plaintext, { ephemeral, salt: fromBase64Url(rfc.salt) });
assert.equal(toBase64Url(got), rfc.body); ok('cifrado: coincide con el ejemplo oficial del RFC 8291');

// Cifrado: ida y vuelta con un descifrador independiente (el que haría el móvil)
function decrypt(body, uaPrivB64, uaPubB64, authB64) {
  const salt = body.subarray(0, 16); const idlen = body[20]; const asPub = body.subarray(21, 21 + idlen); const cipher = body.subarray(21 + idlen);
  const ecdh = createECDH('prime256v1'); ecdh.setPrivateKey(Buffer.from(uaPrivB64, 'base64url'));
  const shared = ecdh.computeSecret(asPub);
  const ikm = hkdfSync('sha256', shared, Buffer.from(authB64, 'base64url'), Buffer.concat([Buffer.from('WebPush: info\0'), Buffer.from(uaPubB64, 'base64url'), asPub]), 32);
  const cek = hkdfSync('sha256', Buffer.from(ikm), salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16);
  const nonce = hkdfSync('sha256', Buffer.from(ikm), salt, Buffer.from('Content-Encoding: nonce\0'), 12);
  const d = createDecipheriv('aes-128-gcm', Buffer.from(cek), Buffer.from(nonce)); d.setAuthTag(cipher.subarray(-16));
  const plain = Buffer.concat([d.update(cipher.subarray(0, -16)), d.final()]);
  return plain.subarray(0, plain.lastIndexOf(2)).toString();
}
const ua = createECDH('prime256v1'); ua.generateKeys();
const sub = { p256dh: ua.getPublicKey().toString('base64url'), auth: Buffer.from(webcrypto.getRandomValues(new Uint8Array(16))).toString('base64url') };
const msg = JSON.stringify({ title: '¡Buenos días, Alex!', body: 'Tu reto de hoy te espera 🎒' });
const enc = await encryptPayload(sub, msg);
assert.equal(decrypt(Buffer.from(enc), ua.getPrivateKey().toString('base64url'), sub.p256dh, sub.auth), msg); ok('cifrado: un móvil real podría leer el mensaje (tildes y emoji)');

// VAPID
const kp = await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const vPub = toBase64Url(new Uint8Array(await subtle.exportKey('raw', kp.publicKey))); const vPriv = (await subtle.exportKey('jwk', kp.privateKey)).d;
const env0 = { VAPID_PUBLIC_KEY: vPub, VAPID_PRIVATE_KEY: vPriv, VAPID_SUBJECT: 'https://yo.github.io/app/' };
const auth = await vapidAuthorization('https://fcm.googleapis.com/fcm/send/abc', env0, 1_700_000_000_000);
const m = auth.match(/^vapid t=([\w-]+)\.([\w-]+)\.([\w-]+), k=([\w-]+)$/); assert.ok(m, 'formato'); assert.equal(m[4], vPub);
assert.deepEqual(JSON.parse(Buffer.from(m[2], 'base64url')), { aud: 'https://fcm.googleapis.com', exp: 1_700_000_000 + 43200, sub: 'https://yo.github.io/app/' });
const ok2 = await subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, kp.publicKey, Buffer.from(m[3], 'base64url'), Buffer.from(`${m[1]}.${m[2]}`));
assert.ok(ok2); ok('VAPID: firma válida y datos correctos');

// Envío (con fetch de mentira)
const calls = []; let nextStatus = 201;
globalThis.fetch = async (url, init) => { calls.push({ url, init }); return new Response('', { status: nextStatus }); };
const dev = { id: 'd1', endpoint: 'https://push.example/x', ...sub };
let r = await sendPush(dev, { title: 't', body: 'b' }, env0);
assert.deepEqual([r.ok, r.gone, r.status], [true, false, 201]);
assert.equal(calls[0].url, 'https://push.example/x'); assert.equal(calls[0].init.headers['Content-Encoding'], 'aes128gcm'); assert.ok(calls[0].init.headers.Authorization.startsWith('vapid t='));
assert.equal(decrypt(Buffer.from(calls[0].init.body), ua.getPrivateKey().toString('base64url'), sub.p256dh, sub.auth), JSON.stringify({ title: 't', body: 'b' })); ok('sendPush: cabeceras y cuerpo correctos');
nextStatus = 410; r = await sendPush(dev, { title: 't', body: 'b' }, env0); assert.equal(r.gone, true);
nextStatus = 404; r = await sendPush(dev, { title: 't', body: 'b' }, env0); assert.equal(r.gone, true);
nextStatus = 500; r = await sendPush(dev, { title: 't', body: 'b' }, env0); assert.deepEqual([r.ok, r.gone], [false, false]); ok('sendPush: 404/410 = móvil desaparecido; 500 = fallo temporal');
globalThis.fetch = async () => { throw new TypeError('sin red'); };
r = await sendPush(dev, { title: 't', body: 'b' }, env0); assert.deepEqual([r.ok, r.gone, r.status], [false, false, 0]); ok('sendPush: sin red no rompe nada');

// Ruta /push/send del Worker
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname);
db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color) VALUES ('p1','Alex','#fff'),('p2','Lucía','#fff')`);
const mk = (id) => { const e = createECDH('prime256v1'); e.generateKeys(); return { id, p256dh: e.getPublicKey().toString('base64url'), auth: 'BTBZMqHH6r4Tts7J_aSIgg' }; };
const ins = db.sqlite.prepare('INSERT INTO push_devices (id,kind,profile_id,endpoint,p256dh,auth) VALUES (?,?,?,?,?,?)');
for (const [id, kind, pid] of [['c1', 'child', 'p1'], ['c2', 'child', 'p2'], ['m1', 'parent', null], ['m2', 'parent', null]]) { const k = mk(id); ins.run(id, kind, pid, `https://push.example/${id}`, k.p256dh, k.auth); }
const env = { DB: db, API_KEY: 'k', ...env0 };
const post = (body, key = 'k') => worker.fetch(new Request('https://w.example/push/send', { method: 'POST', headers: { 'X-Api-Key': key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), env);
const hit = []; globalThis.fetch = async (url) => { hit.push(url); return new Response('', { status: url.endsWith('m2') ? 410 : 201 }); };
assert.equal((await post({ target: 'parents', title: 'a', body: 'b' }, 'mala')).status, 401); ok('push/send: sin clave de API -> 401');
let res = await post({ target: 'parents', title: 'Alex ha terminado el reto', body: '8/10 (80%)' }); let data = await res.json();
assert.equal(res.status, 200); assert.deepEqual(hit.sort(), ['https://push.example/m1', 'https://push.example/m2']); assert.deepEqual([data.devices, data.sent, data.removed], [2, 1, 1]); ok('push/send: a padres solo llega a móviles de padres; el desaparecido se cuenta');
assert.equal(db.sqlite.prepare("SELECT count(*) n FROM push_devices WHERE id='m2'").get().n, 0); ok('push/send: el móvil que dio 410 se borra de D1');
hit.length = 0; res = await post({ target: { profile_id: 'p1' }, title: 'Hola', body: 'Reto' }); data = await res.json();
assert.deepEqual(hit, ['https://push.example/c1']); assert.equal(data.sent, 1); ok('push/send: a un niño solo llega a los móviles de ese perfil');
for (const bad of [{ target: 'todos', title: 'a', body: 'b' }, { target: 'parents', title: '', body: 'b' }, { target: 'parents', title: 'a', body: 'x'.repeat(301) }, { title: 'a', body: 'b' }]) assert.equal((await post(bad)).status, 400);
ok('push/send: datos no válidos -> 400');
const get = await worker.fetch(new Request('https://w.example/push/send', { headers: { 'X-Api-Key': 'k' } }), env); assert.equal(get.status, 404); ok('push/send: solo acepta POST');
const noKeys = await worker.fetch(new Request('https://w.example/push/send', { method: 'POST', headers: { 'X-Api-Key': 'k' }, body: '{}' }), { ...env, VAPID_PRIVATE_KEY: undefined }); assert.equal(noKeys.status, 500); ok('push/send: sin claves VAPID avisa con un error claro');
console.log(`\n${passed} comprobaciones de push OK`);
