// Cola de escrituras sin conexión: no se bloquea con un error del servidor que no se va, se reenvía al volver a la app
// y no finge guardar cuando el dispositivo está lleno.
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://app.example/', pretendToBeVisual: true });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage });
const R = new URL('../js', import.meta.url).pathname;
const { setConnection } = await import(`${R}/core/api/connection.js`);
const { queueInsert, flushOutbox } = await import(`${R}/core/api/outbox.js`);
const { readOutbox, writeOutbox } = await import(`${R}/core/api/outbox-store.js`);
const { flushWhenVisible } = await import(`${R}/core/api/flush-on-return.js`);
const { GIVE_UP_AFTER_MS } = await import(`${R}/core/api/outbox-poison.js`);

let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };
setConnection('https://api.example', 'k');
let mode = 'offline'; let sent = [];
globalThis.fetch = async (url, init) => {
  if (String(url).includes('/api/sync_events')) return new Response('[]', { status: 201 });
  const rows = JSON.parse(init.body);
  if (mode === 'offline') throw new TypeError('Failed to fetch');
  if (mode === 'server-error' && rows[0].id === 'malo') return new Response('{"error":"x"}', { status: 500 });
  sent.push(rows[0].id);
  return new Response('{}', { status: 201 });
};
const reset = () => { localStorage.clear(); setConnection('https://api.example', 'k'); sent = []; };
const realNow = Date.now;

// 1) Un error del servidor que no se va no bloquea las demás escrituras para siempre
reset(); mode = 'offline';
await queueInsert('answers', [{ id: 'malo' }]); await queueInsert('answers', [{ id: 'bueno' }]);
assert.equal(readOutbox().length, 2); await new Promise((r) => setTimeout(r, 30)); mode = 'server-error'; // deja acabar el reenvío en segundo plano que lanza el segundo guardado
await flushOutbox();
assert.deepEqual(sent, [], 'mientras no pase el tiempo, se espera y no se envía nada'); assert.equal(readOutbox().length, 2);
assert.ok(readOutbox()[0].failingSince, 'se anota desde cuándo falla'); assert.ok(!readOutbox()[1].failingSince);
ok('error del servidor: se espera y se anota desde cuándo falla');
Date.now = () => realNow() + GIVE_UP_AFTER_MS - 60000; await flushOutbox();
assert.equal(readOutbox().length, 2); ok('antes de 7 días sigue esperando');
Date.now = () => realNow() + GIVE_UP_AFTER_MS + 60000; await flushOutbox(); Date.now = realNow;
assert.deepEqual(sent, ['bueno']); assert.equal(readOutbox().length, 0);
ok('pasados 7 días se descarta la escritura que falla y se envía la siguiente');

// 2) Estar sin conexión no descarta nada, por mucho que pase el tiempo
reset(); mode = 'offline';
await queueInsert('answers', [{ id: 'malo' }]);
Date.now = () => realNow() + 3 * GIVE_UP_AFTER_MS; await flushOutbox(); await flushOutbox(); Date.now = realNow;
assert.equal(readOutbox().length, 1); assert.ok(!readOutbox()[0].failingSince);
ok('sin conexión nunca se marca ni se descarta');

// 3) Al volver a la app (pantalla visible) se reenvía la cola
reset(); mode = 'offline'; await queueInsert('answers', [{ id: 'pendiente' }]); mode = 'online';
flushWhenVisible(); document.dispatchEvent(new window.Event('visibilitychange'));
await new Promise((r) => setTimeout(r, 50));
assert.deepEqual(sent, ['pendiente']); assert.equal(readOutbox().length, 0);
ok('al volver a ser visible la app, reenvía lo pendiente');

// 4) Almacenamiento lleno: no se finge que se guardó
reset(); mode = 'offline';
const realSet = dom.window.Storage.prototype.setItem;
dom.window.Storage.prototype.setItem = () => { throw new dom.window.DOMException('lleno', 'QuotaExceededError'); };
assert.equal(writeOutbox([{ a: 1 }]), false);
await assert.rejects(() => queueInsert('answers', [{ id: 'x' }]), TypeError);
dom.window.Storage.prototype.setItem = realSet;
assert.equal(readOutbox().length, 0); assert.equal(writeOutbox([]), true);
ok('con el almacenamiento lleno el error llega a quien guarda (no se pierde en silencio)');

console.log(`\n${n} comprobaciones de la cola OK`);
