import assert from 'node:assert/strict';
import { createECDH, webcrypto } from 'node:crypto';
import { reminderSlot } from '../worker/reminder-slot.js';
import { computeStreak } from '../worker/reminder-streak.js';
import { spainDay, addDays, mondayOf } from '../worker/reminder-dates.js';
import { computeStreak as appStreak } from '../js/features/reto/streak/compute-streak.js';
import { spainDay as appDay, addDays as appAdd } from '../js/features/reto/streak/date-keys.js';
import { mondayOf as appMonday } from '../js/features/reto/streak/week-start.js';
import { reminderMessage } from '../worker/reminder-message.js';
import { runReminders } from '../worker/reminder-run.js';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };
const Z = (s) => new Date(s);

// 1) La hora de Madrid, con horario de invierno y de verano
assert.equal(reminderSlot(Z('2026-10-28T07:00:00Z')), 'morning'); assert.equal(reminderSlot(Z('2026-10-28T06:00:00Z')), null); ok('invierno: 08:00 de Madrid = 07:00 UTC; las 06:00 UTC no avisan');
assert.equal(reminderSlot(Z('2026-07-15T06:00:00Z')), 'morning'); assert.equal(reminderSlot(Z('2026-07-15T07:00:00Z')), null); ok('verano: 08:00 de Madrid = 06:00 UTC; las 07:00 UTC no avisan');
assert.equal(reminderSlot(Z('2026-10-28T17:30:00Z')), 'evening'); assert.equal(reminderSlot(Z('2026-10-28T16:30:00Z')), null); ok('invierno: 18:30 de Madrid = 17:30 UTC; las 16:30 UTC no avisan');
assert.equal(reminderSlot(Z('2026-07-15T16:30:00Z')), 'evening'); assert.equal(reminderSlot(Z('2026-07-15T17:30:00Z')), null); ok('verano: 18:30 de Madrid = 16:30 UTC; las 17:30 UTC no avisan');
// Días del cambio de hora (29 mar y 25 oct de 2026)
assert.equal(reminderSlot(Z('2026-03-29T06:00:00Z')), 'morning'); assert.equal(reminderSlot(Z('2026-03-29T07:00:00Z')), null); assert.equal(reminderSlot(Z('2026-03-29T16:30:00Z')), 'evening');
assert.equal(reminderSlot(Z('2026-10-25T07:00:00Z')), 'morning'); assert.equal(reminderSlot(Z('2026-10-25T06:00:00Z')), null); assert.equal(reminderSlot(Z('2026-10-25T17:30:00Z')), 'evening'); ok('los días del cambio de hora también avisan una sola vez');
for (const [label, [y, mo, d]] of Object.entries({ invierno: [2026, 9, 28], verano: [2026, 6, 15], 'cambio de marzo': [2026, 2, 29], 'cambio de octubre': [2026, 9, 25] })) {
  const hits = []; for (let h = 0; h < 24; h++) for (const m of [0, 30]) { const slot = reminderSlot(new Date(Date.UTC(y, mo, d, h, m))); if (slot) hits.push(slot); }
  assert.deepEqual(hits.sort(), ['evening', 'morning'], label);
} ok('el cron se dispara 48 veces al día (cada 30 min) y solo 2 avisan: una de mañana y una de tarde');

// 2) El Worker calcula las fechas y la racha igual que la app
assert.equal(spainDay(Z('2026-10-28T22:30:00Z')), '2026-10-28'); assert.equal(spainDay(Z('2026-10-28T23:30:00Z')), '2026-10-29'); assert.equal(spainDay(Z('2026-10-28T22:30:00Z')), appDay(Z('2026-10-28T22:30:00Z')));
for (const d of ['2026-10-26', '2026-10-28', '2026-11-01', '2026-03-29']) { assert.equal(addDays(d, 5), appAdd(d, 5)); assert.equal(mondayOf(d), appMonday(d)); }
let seed = 42; const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
for (let i = 0; i < 3000; i++) { const today = '2026-10-28'; const days = []; for (let k = 1; k <= 40; k++) if (rnd() < 0.7) days.push(addDays(today, -k)); if (rnd() < 0.4) days.push(today); assert.equal(computeStreak(days, today), appStreak(days, today)); }
ok('fechas y racha: 3000 casos al azar dan lo mismo que la app');

// 3) Mensajes
const base = { name: 'Alex', url: '#/p/a/c/4-primaria/reto' };
assert.deepEqual(reminderMessage({ ...base, slot: 'morning', streak: 9 }), { title: '¡Buenos días, Alex! ☀️', body: 'Tu reto de hoy te está esperando. Son solo 10 preguntas.', tag: 'reto-recordatorio', url: base.url });
assert.equal(reminderMessage({ ...base, slot: 'evening', streak: 5 }).title, '¡No pierdas tu racha, Alex! 🔥'); assert.equal(reminderMessage({ ...base, slot: 'evening', streak: 5 }).body, 'Llevas 5 días seguidos. Haz el reto de hoy y sigue sumando.');
assert.equal(reminderMessage({ ...base, slot: 'evening', streak: 1 }).body, 'Llevas 1 día seguido. Haz el reto de hoy y sigue sumando.');
assert.equal(reminderMessage({ ...base, slot: 'evening', streak: 0 }).title, '¡Todavía estás a tiempo, Alex!'); assert.equal(reminderMessage({ ...base, slot: 'evening', streak: 0 }).body, 'Haz hoy tu reto de 10 preguntas antes de que acabe el día.'); ok('los tres mensajes (y "1 día" en singular)');

// 4) El cron completo con una base de datos de prueba y un servicio de avisos de mentira
const kp = await webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const b64 = (buf) => Buffer.from(buf).toString('base64url');
const env = { VAPID_PUBLIC_KEY: b64(await webcrypto.subtle.exportKey('raw', kp.publicKey)), VAPID_PRIVATE_KEY: (await webcrypto.subtle.exportKey('jwk', kp.privateKey)).d, VAPID_SUBJECT: 'https://yo.github.io/app/' };
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname); env.DB = db; const sql = db.sqlite;
sql.exec(`INSERT INTO profiles (id,name,avatar_color) VALUES ('alex','Alex','#FFC53D'),('lucia','Lucía','#8EDBC0'),('mateo','Mateo','#FFA8C5'),('sara','Sara','#A8C5FF'),('nadie','Nadie','#FFA8C5')`);
// alex, lucia y sara: tema liberado Y estudiado. mateo: nada. leo: liberado pero sin estudiar
sql.exec(`INSERT INTO profiles (id,name,avatar_color) VALUES ('leo','Leo','#FFA8C5')`);
for (const p of ['alex', 'lucia', 'sara', 'leo']) sql.prepare(`INSERT INTO topic_release (id,profile_id,course_id,subject_id,topic_id) VALUES (?,?,?,?,?)`).run('r' + p, p, '4-primaria', 'mates', 'tablas');
for (const p of ['alex', 'lucia', 'sara']) sql.prepare(`INSERT INTO study_progress (id,profile_id,course_id,subject_id,topic_id,completed_at) VALUES (?,?,?,?,?,?)`).run('s' + p, p, '4-primaria', 'mates', 'tablas', '2026-10-20T10:00:00Z');
sql.prepare(`INSERT INTO study_progress (id,profile_id,course_id,subject_id,topic_id,completed_at) VALUES ('sx','mateo','4-primaria','mates','tablas','2026-10-20T10:00:00Z')`).run(); // estudiado pero no liberado
const ua = createECDH('prime256v1'); ua.generateKeys(); const keys = () => ({ p256dh: b64(ua.getPublicKey()), auth: b64(webcrypto.getRandomValues(new Uint8Array(16))) });
const dev = (id, kind, profile, endpoint) => { const k = keys(); sql.prepare('INSERT INTO push_devices (id,kind,profile_id,endpoint,p256dh,auth) VALUES (?,?,?,?,?,?)').run(id, kind, profile, endpoint, k.p256dh, k.auth); };
dev('d-alex', 'child', 'alex', 'https://push.example/alex'); dev('d-lucia1', 'child', 'lucia', 'https://push.example/lucia1'); dev('d-lucia2', 'child', 'lucia', 'https://push.example/lucia2');
dev('d-mateo', 'child', 'mateo', 'https://push.example/mateo'); dev('d-leo', 'child', 'leo', 'https://push.example/leo'); dev('d-sara', 'child', 'sara', 'https://push.example/sara'); dev('d-padres', 'parent', null, 'https://push.example/padres');
const fin = (profile, day) => sql.prepare('INSERT INTO reto_diario (id,profile_id,course_id,day,questions,answers,finished_at) VALUES (?,?,?,?,?,?,?)').run(profile + day, profile, '4-primaria', day, '[]', '[]', day + 'T10:00:00Z');
const unfinished = (profile, day) => sql.prepare('INSERT INTO reto_diario (id,profile_id,course_id,day,questions,answers) VALUES (?,?,?,?,?,?)').run(profile + day, profile, '4-primaria', day, '[]', '[]');
const today = '2026-10-28';
fin('alex', today); fin('alex', '2026-10-27');                                   // Alex ya lo ha hecho hoy
for (const d of ['2026-10-27', '2026-10-26', '2026-10-25', '2026-10-24', '2026-10-23']) fin('lucia', d); // Lucía: racha de 5 sin el de hoy
unfinished('sara', today);                                                        // Sara lo empezó pero no lo terminó, sin racha
const pushes = []; let status = () => 201;
globalThis.fetch = async (url, init) => { pushes.push({ url, init }); return new Response('', { status: status(url) }); };
const sentTo = () => pushes.map((p) => p.url.replace('https://push.example/', '')).sort();

let r = await runReminders(env, Z('2026-10-28T10:00:00Z').getTime()); assert.deepEqual(r, { slot: null }); assert.equal(pushes.length, 0); ok('a una hora que no es de recordatorio no se envía nada');
r = await runReminders(env, Z('2026-10-28T07:00:00Z').getTime());
assert.deepEqual(r, { slot: 'morning', sent: 2, done: 1, 'no-topics': 2, failed: 0 }); assert.deepEqual(sentTo(), ['lucia1', 'lucia2', 'sara']); ok('08:00: avisa a Lucía (sus 2 móviles) y a Sara; no a Alex (ya hecho), ni a Mateo (estudiado pero no liberado), ni a Leo (liberado pero sin estudiar), ni a los padres');
pushes.length = 0; r = await runReminders(env, Z('2026-10-28T17:30:00Z').getTime());
assert.deepEqual(r, { slot: 'evening', sent: 2, done: 1, 'no-topics': 2, failed: 0 }); assert.deepEqual(sentTo(), ['lucia1', 'lucia2', 'sara']); ok('18:30: mismo grupo de perfiles');
pushes.length = 0; sql.exec(`DELETE FROM reto_diario WHERE profile_id='sara'`); fin('sara', '2026-10-27');
r = await runReminders(env, Z('2026-10-28T17:30:00Z').getTime()); assert.equal(r.sent, 2); ok('con un día de racha también se envía');
// El contenido llega cifrado; comprobamos el cuerpo con un descifrador a través del propio servicio de mentira
import { createDecipheriv, hkdfSync } from 'node:crypto';
function decryptFor(devRow, body) { const ecdh = createECDH('prime256v1'); ecdh.setPrivateKey(ua.getPrivateKey()); const salt = body.subarray(0, 16); const idlen = body[20]; const asPub = body.subarray(21, 21 + idlen); const cipher = body.subarray(21 + idlen); const shared = ecdh.computeSecret(asPub); const ikm = hkdfSync('sha256', shared, Buffer.from(devRow.auth, 'base64url'), Buffer.concat([Buffer.from('WebPush: info\0'), Buffer.from(devRow.p256dh, 'base64url'), asPub]), 32); const cek = hkdfSync('sha256', Buffer.from(ikm), salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16); const nonce = hkdfSync('sha256', Buffer.from(ikm), salt, Buffer.from('Content-Encoding: nonce\0'), 12); const d = createDecipheriv('aes-128-gcm', Buffer.from(cek), Buffer.from(nonce)); d.setAuthTag(cipher.subarray(-16)); const plain = Buffer.concat([d.update(cipher.subarray(0, -16)), d.final()]); return JSON.parse(plain.subarray(0, plain.lastIndexOf(2)).toString()); }
const row = (id) => sql.prepare('SELECT * FROM push_devices WHERE id = ?').get(id);
const bodyOf = (name, id) => decryptFor(row(id), Buffer.from(pushes.find((p) => p.url.endsWith(name)).init.body));
assert.deepEqual(bodyOf('lucia1', 'd-lucia1'), { title: '¡No pierdas tu racha, Lucía! 🔥', body: 'Llevas 5 días seguidos. Haz el reto de hoy y sigue sumando.', tag: 'reto-recordatorio', url: '#/p/lucia/c/4-primaria/reto' }); ok('el aviso de Lucía a las 18:30 menciona su racha de 5 días y abre su reto');
assert.equal(bodyOf('sara', 'd-sara').body, 'Llevas 1 día seguido. Haz el reto de hoy y sigue sumando.');
pushes.length = 0; await runReminders(env, Z('2026-10-28T07:00:00Z').getTime()); assert.equal(bodyOf('lucia2', 'd-lucia2').title, '¡Buenos días, Lucía! ☀️'); ok('el aviso de las 08:00 es el de buenos días');
// Racha rota → mensaje sin racha
sql.exec(`DELETE FROM reto_diario WHERE profile_id='lucia'`); fin('lucia', '2026-10-20'); pushes.length = 0; await runReminders(env, Z('2026-10-28T17:30:00Z').getTime());
assert.equal(bodyOf('lucia1', 'd-lucia1').title, '¡Todavía estás a tiempo, Lucía!'); ok('con la racha rota, el aviso de la tarde no habla de racha');
// Un móvil que ya no existe se borra y un fallo no frena a los demás
pushes.length = 0; status = (u) => (u.endsWith('lucia1') ? 410 : 201); await runReminders(env, Z('2026-10-28T17:30:00Z').getTime());
assert.equal(row('d-lucia1'), undefined); assert.ok(row('d-lucia2')); assert.ok(row('d-padres')); ok('un móvil dado de baja (410) se borra; los demás siguen');
status = () => 201; pushes.length = 0;
const noKeys = await runReminders({ DB: db }, Z('2026-10-28T07:00:00Z').getTime()); assert.equal(noKeys.error, 'Faltan las claves VAPID'); assert.equal(pushes.length, 0); ok('sin claves VAPID no envía nada y lo dice');
// El cron de verdad: el Worker tiene scheduled() y llama a lo anterior
pushes.length = 0; const waits = []; await worker.scheduled({ scheduledTime: Z('2026-10-28T07:00:00Z').getTime() }, env, { waitUntil: (p) => waits.push(p) }); await Promise.all(waits); assert.ok(pushes.length >= 1); ok('worker.scheduled() ejecuta los recordatorios');
console.log('\n' + n + ' comprobaciones OK'); process.exit(0);
