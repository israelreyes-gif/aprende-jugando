import assert from 'node:assert/strict';
import { createDecipheriv, createECDH, hkdfSync, webcrypto } from 'node:crypto';
import { toBase64Url } from '../worker/push-base64url.js';
import worker from '../worker/worker.js';
import { errorMessage } from '../worker/error-alert.js';
import { makeD1 } from './d1-shim.js';
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };
function decrypt(body, uaPrivB64, uaPubB64, authB64) {
  const salt = body.subarray(0, 16); const idlen = body[20]; const asPub = body.subarray(21, 21 + idlen); const cipher = body.subarray(21 + idlen);
  const ecdh = createECDH('prime256v1'); ecdh.setPrivateKey(Buffer.from(uaPrivB64, 'base64url')); const shared = ecdh.computeSecret(asPub);
  const ikm = hkdfSync('sha256', shared, Buffer.from(authB64, 'base64url'), Buffer.concat([Buffer.from('WebPush: info\0'), Buffer.from(uaPubB64, 'base64url'), asPub]), 32);
  const cek = hkdfSync('sha256', Buffer.from(ikm), salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16);
  const nonce = hkdfSync('sha256', Buffer.from(ikm), salt, Buffer.from('Content-Encoding: nonce\0'), 12);
  const d = createDecipheriv('aes-128-gcm', Buffer.from(cek), Buffer.from(nonce)); d.setAuthTag(cipher.subarray(-16));
  const plain = Buffer.concat([d.update(cipher.subarray(0, -16)), d.final()]); return plain.subarray(0, plain.lastIndexOf(2)).toString();
}
const kp = await webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const vPub = toBase64Url(new Uint8Array(await webcrypto.subtle.exportKey('raw', kp.publicKey))); const vPriv = (await webcrypto.subtle.exportKey('jwk', kp.privateKey)).d;
const vapid = { VAPID_PUBLIC_KEY: vPub, VAPID_PRIVATE_KEY: vPriv, VAPID_SUBJECT: 'https://yo.github.io/app/' };
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname);
db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color) VALUES ('p1','Alex','#fff')`);
const keys = {}; const ins = db.sqlite.prepare('INSERT INTO push_devices (id,kind,profile_id,endpoint,p256dh,auth) VALUES (?,?,?,?,?,?)');
for (const [id, kind, pid] of [['c1', 'child', 'p1'], ['m1', 'parent', null], ['m2', 'parent', null]]) { const e = createECDH('prime256v1'); e.generateKeys(); keys[id] = { priv: e.getPrivateKey().toString('base64url'), pub: e.getPublicKey().toString('base64url'), auth: 'BTBZMqHH6r4Tts7J_aSIgg' }; ins.run(id, kind, pid, `https://push.example/${id}`, keys[id].pub, keys[id].auth); }
// Una base de datos que falla al leer ciertas tablas (simula un fallo interno)
const breaking = (pattern) => ({ prepare: (sql) => { if (pattern.test(sql)) throw new Error('D1_ERROR: no such table: simulada'); return db.prepare(sql); }, batch: (...a) => db.batch(...a) });
const sent = []; globalThis.fetch = async (url, init) => { sent.push({ url, body: Buffer.from(init.body) }); return new Response('', { status: 201 }); };
const run = async (req, env, withCtx = true) => { const pending = []; const res = await worker.fetch(req, env, withCtx ? { waitUntil: (p) => pending.push(p) } : undefined); await Promise.all(pending); return res; };
const get = (path, key = 'k') => new Request(`https://w.example${path}`, { headers: { 'X-Api-Key': key } });
const readFor = (id) => JSON.parse(decrypt(sent.find((s) => s.url.endsWith(id)).body, keys[id].priv, keys[id].pub, keys[id].auth));

// 1) Un error 500 avisa a los móviles de padres (y solo a ellos)
let env = { DB: breaking(/profiles/i), API_KEY: 'k', ...vapid };
// loadSchema debe seguir funcionando: usa PRAGMA/sqlite_master, no 'profiles'; la tabla falla al pedirla
let res = await run(get('/api/profiles'), env);
assert.equal(res.status, 500); assert.deepEqual(sent.map((s) => s.url).sort(), ['https://push.example/m1', 'https://push.example/m2']); ok('un 500 avisa a los 2 móviles de padres y no al del niño');
const msg = readFor('m1'); assert.equal(msg.title, 'Error en el servidor'); assert.match(msg.body, /^GET \/api\/profiles · .*simulada/); assert.equal(msg.url, '#/parents'); assert.equal(msg.tag, 'error-GET /api/profiles'); ok('el aviso dice dónde falló y por qué, y abre la zona de padres: ' + JSON.stringify(msg.body));
assert.ok(!JSON.stringify(msg).includes('"k"') && !JSON.stringify(msg).includes(vPriv)); ok('el aviso no lleva claves');

// 2) Errores del que llama (4xx) no avisan
sent.length = 0; env = { DB: db, API_KEY: 'k', ...vapid };
assert.equal((await run(get('/api/profiles', 'mala'), env)).status, 401);
assert.equal((await run(get('/api/noexiste'), env)).status, 404);
assert.equal((await run(new Request('https://w.example/api/profiles', { method: 'POST', headers: { 'X-Api-Key': 'k' }, body: '{' }), env)).status, 400);
assert.equal((await run(new Request('https://w.example/api/profiles', { method: 'POST', headers: { 'X-Api-Key': 'k', 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'p1', name: 'Dup', avatar_color: '#fff' }) }), env)).status, 409);
assert.equal(sent.length, 0); ok('401, 404, 400 y 409 no avisan');

// 3) Un fallo del propio envío de avisos no provoca otro aviso
assert.equal((await run(new Request('https://w.example/push/send', { method: 'POST', headers: { 'X-Api-Key': 'k' }, body: '{}' }), { DB: db, API_KEY: 'k' })).status, 500);
assert.equal(sent.length, 0); ok('un fallo de /push/send no avisa (evita bucles)');

// 4) Sin claves VAPID, sin móviles de padres o sin contexto: responde igual y no lanza
env = { DB: breaking(/profiles/i), API_KEY: 'k' }; assert.equal((await run(get('/api/profiles'), env)).status, 500); assert.equal(sent.length, 0);
const db2 = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname); const b2 = { prepare: (sql) => (/profiles/i.test(sql) ? (() => { throw new Error('x'); })() : db2.prepare(sql)), batch: () => {} };
assert.equal((await run(get('/api/profiles'), { DB: b2, API_KEY: 'k', ...vapid })).status, 500); assert.equal(sent.length, 0);
assert.equal((await run(get('/api/profiles'), { DB: breaking(/profiles/i), API_KEY: 'k', ...vapid }, false)).status, 500); assert.equal(sent.length, 0);
ok('sin claves, sin padres registrados o sin contexto: 500 normal, sin excepciones ni avisos');
globalThis.fetch = async () => { throw new TypeError('sin red'); };
assert.equal((await run(get('/api/profiles'), { DB: breaking(/profiles/i), API_KEY: 'k', ...vapid })).status, 500); ok('si el aviso no se puede entregar, el Worker responde igual');

// 5) El cron avisa si un recordatorio falla
globalThis.fetch = async (url, init) => { sent.push({ url, body: Buffer.from(init.body) }); return new Response('', { status: 201 }); }; sent.length = 0;
let pending = []; await worker.scheduled({ scheduledTime: Date.parse('2026-10-28T07:00:00Z') }, { DB: breaking(/topic_release/i), ...vapid }, { waitUntil: (p) => pending.push(p) }); await Promise.all(pending);
assert.deepEqual(sent.map((s) => s.url).sort(), ['https://push.example/m1', 'https://push.example/m2']); const cron = readFor('m1'); assert.equal(cron.body, 'Recordatorios · 1 perfil(es) sin avisar'); ok('cron: un recordatorio fallido avisa a padres → ' + JSON.stringify(cron.body));
sent.length = 0; pending = []; await worker.scheduled({ scheduledTime: Date.parse('2026-10-28T10:00:00Z') }, { DB: db, ...vapid }, { waitUntil: (p) => pending.push(p) }); await Promise.all(pending); assert.equal(sent.length, 0); ok('cron: fuera de hora o sin fallos no avisa');
assert.equal(errorMessage({ where: 'x'.repeat(400), detail: 'y' }).body.length, 300); assert.ok(errorMessage({ where: 'x'.repeat(400), detail: 'y' }).tag.length <= 60); ok('textos recortados a los límites del envío (300 y 60)');
console.log(`${n} ✓`);
