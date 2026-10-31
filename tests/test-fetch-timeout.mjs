// Un servidor que no contesta no debe dejar la app esperando para siempre.
import assert from 'node:assert/strict';
import http from 'node:http';
import { fetchWithTimeout } from '../js/core/api/fetch-timeout.js';
import { isRetryable } from '../js/core/api/retry.js';

const ok = (name) => console.log(`✓ ${name}`);

const colgado = http.createServer(() => {}); // acepta la petición y nunca responde
const rapido = http.createServer((req, res) => res.end('{"ok":true}'));
await Promise.all([colgado, rapido].map((s) => new Promise((r) => s.listen(0, '127.0.0.1', r))));
const urlDe = (s) => `http://127.0.0.1:${s.address().port}/`;

const t0 = Date.now();
const err = await fetchWithTimeout(urlDe(colgado), {}, 300).catch((e) => e);
assert.equal(err.status, 408); assert.equal(err.code, 'timeout');
assert.ok(Date.now() - t0 < 2000);
ok('si el servidor no contesta, falla con status 408 a los pocos instantes');

assert.equal(isRetryable(err), true);
ok('ese fallo se puede reintentar (la cola sin conexión lo guarda)');

const res = await fetchWithTimeout(urlDe(rapido), {}, 2000);
assert.deepEqual(await res.json(), { ok: true });
ok('si el servidor contesta a tiempo, todo igual que antes');

const caido = await fetchWithTimeout('http://127.0.0.1:1/', {}, 2000).catch((e) => e);
assert.ok(caido instanceof TypeError); assert.equal(caido.code, undefined);
ok('un fallo de red normal sigue siendo TypeError (no se confunde con el tiempo agotado)');

colgado.closeAllConnections?.(); colgado.close(); rapido.close();
