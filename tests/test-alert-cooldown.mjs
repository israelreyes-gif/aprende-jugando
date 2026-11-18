import assert from 'node:assert/strict';
import { createECDH, webcrypto } from 'node:crypto';
import { toBase64Url } from '../worker/push-base64url.js';
import { claimAlert, COOLDOWN_MS } from '../worker/alert-cooldown.js';
import { alertParents, errorMessage } from '../worker/error-alert.js';
import { makeD1 } from './d1-shim.js';
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };
const schema = new URL('./fixtures/schema.sql', import.meta.url).pathname;

// 1) claimAlert: primero avisa, los repetidos se callan y cuentan, pasado el tiempo avisa con el contador
let db = makeD1(schema); const T = Date.UTC(2026, 10, 18, 12, 0, 0);
assert.deepEqual(await claimAlert(db, 'a', T), { send: true, skipped: 0 });
assert.deepEqual(await claimAlert(db, 'a', T + 1000), { send: false, skipped: 0 });
assert.deepEqual(await claimAlert(db, 'a', T + COOLDOWN_MS - 1), { send: false, skipped: 0 });
assert.deepEqual(await claimAlert(db, 'a', T + COOLDOWN_MS), { send: true, skipped: 2 });
assert.deepEqual(await claimAlert(db, 'a', T + COOLDOWN_MS + 1), { send: false, skipped: 0 }); ok('un mismo fallo avisa una vez cada 15 min y cuenta los callados');
assert.deepEqual(await claimAlert(db, 'b', T + 5), { send: true, skipped: 0 }); ok('otro fallo (otra etiqueta) no queda bloqueado');
await claimAlert(db, 'vieja', T - 2 * 24 * 3600 * 1000); await claimAlert(db, 'nueva', T);
assert.equal(db.sqlite.prepare("SELECT COUNT(*) c FROM alert_cooldown WHERE tag = 'vieja'").get().c, 0); ok('se limpian las etiquetas de más de un día');

// 2) Sin tabla (aún sin crear en D1) o con la base caída: avisa igualmente
const noTable = makeD1(schema); noTable.sqlite.exec('DROP TABLE alert_cooldown');
assert.deepEqual(await claimAlert(noTable, 'a', T), { send: true, skipped: 0 });
assert.deepEqual(await claimAlert({ prepare: () => { throw new Error('caída'); } }, 'a', T), { send: true, skipped: 0 }); ok('si falla el enfriamiento, se avisa igualmente');

// 3) Con alertParents: 5 fallos seguidos mandan 1 aviso; después de 15 min, otro que dice "y 4 más"
const kp = await webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const env0 = { VAPID_PUBLIC_KEY: toBase64Url(new Uint8Array(await webcrypto.subtle.exportKey('raw', kp.publicKey))), VAPID_PRIVATE_KEY: (await webcrypto.subtle.exportKey('jwk', kp.privateKey)).d, PUSH_ALLOWED_HOSTS: 'push.example', VAPID_SUBJECT: 'https://yo.github.io/app/' };
db = makeD1(schema); const e = createECDH('prime256v1'); e.generateKeys();
db.sqlite.prepare("INSERT INTO push_devices (id,kind,profile_id,endpoint,p256dh,auth) VALUES ('m1','parent',NULL,'https://push.example/m1',?,?)").run(e.getPublicKey().toString('base64url'), 'BTBZMqHH6r4Tts7J_aSIgg');
const sent = []; globalThis.fetch = async (url) => { sent.push(url); return new Response('', { status: 201 }); };
const env = { DB: db, ...env0 };
for (let i = 0; i < 5; i++) await alertParents(env, { where: 'GET /api/answers', detail: 'Error 500' });
assert.equal(sent.length, 1); ok('5 errores iguales seguidos: 1 solo aviso');
await alertParents(env, { where: 'POST /api/sessions', detail: 'Error 500' });
assert.equal(sent.length, 2); ok('un error en otra ruta sí avisa');
db.sqlite.prepare("UPDATE alert_cooldown SET last_sent = ? WHERE tag = 'error-GET /api/answers'").run(new Date(Date.now() - COOLDOWN_MS - 1000).toISOString());
await alertParents(env, { where: 'GET /api/answers', detail: 'Error 500' });
assert.equal(sent.length, 3); ok('pasados 15 min vuelve a avisar');

// 4) El texto del aviso con contador
assert.equal(errorMessage({ where: 'W', detail: 'D' }).body, 'W · D');
assert.equal(errorMessage({ where: 'W', detail: 'D', skipped: 4 }).body, 'W · D (y 4 más desde el último aviso)');
assert.ok(errorMessage({ where: 'W', detail: 'D', skipped: 4 }).html.includes('(y 4 más desde el último aviso)'));
assert.equal(errorMessage({ where: 'W', detail: 'D', skipped: 4 }).tag, errorMessage({ where: 'W', detail: 'D' }).tag); ok('el aviso dice cuántos se callaron y conserva su etiqueta');
console.log(`\n${n} comprobaciones OK`);
