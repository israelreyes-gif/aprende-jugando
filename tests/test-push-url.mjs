import assert from 'node:assert/strict';
import { cleanPushUrl } from '../worker/push-url.js';
import { handlePush } from '../worker/push-handle-push.js';
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };

for (const v of ['#/parents', '#/p/alex/c/4-primaria/reto', undefined, '']) cleanPushUrl(v);
ok('rutas internas y sin url: se aceptan');

for (const v of ['https://malo.example', 'http://malo.example', '//malo.example', 'javascript:alert(1)', 'data:text/html,x', '/ruta', './x', '#', '#/a b', '#/a\nb', '#/a\\b', 'x'.repeat(201), 5, {}]) {
  assert.throws(() => cleanPushUrl(v), (e) => e.status === 400, String(v));
}
ok('direcciones externas, esquemas raros, espacios y textos largos: 400');

const env = { VAPID_PUBLIC_KEY: 'a', VAPID_PRIVATE_KEY: 'b', VAPID_SUBJECT: 'c', DB: { prepare: () => ({ all: async () => ({ results: [] }), bind() { return this; } }) } };
const call = (url) => handlePush(new Request('https://w.example/push/send', { method: 'POST', body: JSON.stringify({ target: 'parents', title: 't', body: 'b', url }) }), env, ['push', 'send'], {}, { owner: 'parent' });
assert.equal((await call('#/parents')).status, 200);
await assert.rejects(call('https://malo.example'), (e) => e.status === 400);
ok('POST /push/send rechaza una url externa y acepta una interna');
console.log(`\n${n} comprobaciones OK`);
