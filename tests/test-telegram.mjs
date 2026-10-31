import assert from 'node:assert/strict';
import { sendTelegram, telegramText } from '../worker/telegram-send.js';
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
globalThis.fetch = realFetch;
