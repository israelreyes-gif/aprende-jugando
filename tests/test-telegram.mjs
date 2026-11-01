import assert from 'node:assert/strict';
import { sendTelegram, telegramText } from '../worker/telegram-send.js';
import { telegramHtml, stripHtml } from '../worker/telegram-html.js';
import { errorMessage } from '../worker/error-alert.js';
import { sendToDevices } from '../worker/push-send-to.js';

const realFetch = globalThis.fetch;
let calls = [];
globalThis.fetch = async (url, init) => { calls.push({ url: String(url), body: JSON.parse(init.body) }); return new Response('{"ok":true}', { status: 200 }); };
const env = { TELEGRAM_BOT_TOKEN: 'T', TELEGRAM_CHAT_ID: '-5276407828' };
const msg = { title: '¡Buenos días, Alex! ☀️', body: 'Tu reto de hoy te está esperando.' };

assert.equal(telegramText(msg), '¡Buenos días, Alex! ☀️\nTu reto de hoy te está esperando.'); console.log('✓ texto: título y cuerpo');
assert.equal(await sendTelegram(env, msg), true);
assert.equal(calls[0].url, 'https://api.telegram.org/botT/sendMessage'); assert.equal(calls[0].body.chat_id, '-5276407828'); console.log('✓ envía al grupo');
calls = []; assert.equal(await sendTelegram({}, msg), false); assert.equal(calls.length, 0); console.log('✓ sin secretos no envía ni falla');
globalThis.fetch = async () => { throw new TypeError('red caída'); };
assert.equal(await sendTelegram(env, msg), false); console.log('✓ si Telegram falla, no lanza');
globalThis.fetch = async (url, init) => { calls.push({ url: String(url), body: JSON.parse(init.body) }); return new Response('{"ok":true}'); };
calls = []; const db = { prepare: () => ({ bind: () => ({ run: async () => {} }) }) };
const res = await sendToDevices(db, env, [], msg);
assert.equal(calls.length, 1); assert.deepEqual(res, { sent: 0, removed: 0, failed: 0 }); console.log('✓ sendToDevices copia el aviso a Telegram');
// Padres: solo Telegram (sin push); si Telegram falla, cae al push
const pushed = []; const dev = { id: 'd1', endpoint: 'https://push.example/x', p256dh: 'x', auth: 'x' };
globalThis.fetch = async (url, init) => { if (String(url).includes('telegram')) return new Response('{}', { status: 200 }); pushed.push(String(url)); return new Response('', { status: 201 }); };
let r = await sendToDevices(db, env, [dev], msg, { parents: true });
assert.equal(pushed.length, 0); assert.equal(r.sent, 1); assert.equal(r.via, 'telegram'); console.log('✓ a los padres: solo Telegram, sin push');
globalThis.fetch = async (url) => { if (String(url).includes('telegram')) return new Response('{}', { status: 500 }); pushed.push(String(url)); return new Response('', { status: 201 }); };
r = await sendToDevices(db, env, [dev], msg, { parents: true });
assert.equal(r.via, undefined); assert.equal(r.sent + r.failed + r.removed, 1); console.log('✓ si Telegram falla, se intenta el push a los padres');
r = await sendToDevices(db, {}, [dev], msg, { parents: true });
assert.equal(r.via, undefined); assert.equal(r.sent + r.failed + r.removed, 1); console.log('✓ sin Telegram configurado, los padres reciben el push como antes');
// Formato (negrita)
assert.equal(telegramHtml({ title: 'Alex ha hecho el reto', body: '10 de 10 (100 %) ✅ · +15 puntos' }), '<b>Alex ha hecho el reto</b>\n<b>10 de 10 (100 %)</b> ✅ · +15 puntos');
assert.equal(telegramHtml({ title: 'Alex ha practicado', body: 'Inglés · Was / were · 7 de 8 (88 %) ✅ · +11 puntos' }), '<b>Alex ha practicado</b>\nInglés · Was / were · <b>7 de 8 (88 %)</b> ✅ · +11 puntos');
assert.equal(telegramHtml({ title: '¡Alex ha subido a Detective!', body: 'Nivel 5 · 350 puntos 🔍' }), '<b>¡Alex ha subido a Detective!</b>\nNivel 5 · <b>350 puntos</b> 🔍');
assert.equal(telegramHtml({ title: '¡No pierdas tu racha, Alex! 🔥', body: 'Llevas 5 días seguidos. Haz el reto.' }), '<b>¡No pierdas tu racha, Alex! 🔥</b>\nLlevas <b>5 días seguidos</b>. Haz el reto.');
assert.equal(telegramHtml({ title: 'A <b> & B', body: 'x < y' }), '<b>A &lt;b&gt; &amp; B</b>\nx &lt; y'); console.log('✓ negrita en título y en lo importante; el texto se escapa');
const err = errorMessage({ where: 'POST /api/profiles', detail: 'fallo <raro>' });
assert.equal(telegramHtml(err), '<b>Error en el servidor</b>\n<code>POST /api/profiles</code> · fallo &lt;raro&gt;'); assert.equal(stripHtml(telegramHtml(err)), 'Error en el servidor\nPOST /api/profiles · fallo <raro>'); console.log('✓ el error lleva el origen en código');

// Telegram rechaza el HTML → se reenvía en texto plano
const bodies = [];
globalThis.fetch = async (url, init) => { const b = JSON.parse(init.body); bodies.push(b); return new Response('{}', { status: b.parse_mode ? 400 : 200 }); };
assert.equal(await sendTelegram(env, { title: 'T', body: 'B' }), true); assert.equal(bodies.length, 2); assert.equal(bodies[1].parse_mode, undefined); assert.equal(bodies[1].text, 'T\nB'); console.log('✓ si rechaza el formato, reenvía en texto plano');
globalThis.fetch = realFetch;
