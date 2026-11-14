import assert from 'node:assert/strict';
import { isPushEndpoint, assertPushEndpoints } from '../worker/push-endpoint.js';
const ok = (m) => console.log('  ✓ ' + m);
for (const u of ['https://web.push.apple.com/abc', 'https://fcm.googleapis.com/fcm/send/x', 'https://updates.push.services.mozilla.com/wpush/v2/x', 'https://db5p.notify.windows.com/w/?token=1', 'https://fcm.googleapis.com:443/x'])
  assert.equal(isPushEndpoint(u, {}), true, u);
ok('acepta Apple, Google, Mozilla y Windows (con subdominios)');
for (const u of ['http://fcm.googleapis.com/x', 'https://evil.com/x', 'https://fcm.googleapis.com.evil.com/x', 'https://evilpush.apple.com.x.io/', 'https://notpush.apple.com/x', 'https://fcm.googleapis.com:8443/x', 'https://u:p@fcm.googleapis.com/x', 'https://127.0.0.1/x', 'https://fcm.googleapis.com/' + 'a'.repeat(1000), '', null, 5, 'no es url'])
  assert.equal(isPushEndpoint(u, {}), false, String(u));
ok('rechaza http, otros dominios, puertos, usuario, demasiado largas y basura');
assert.equal(isPushEndpoint('http://localhost:8791/p', { PUSH_ALLOWED_HOSTS: 'localhost' }), true);
assert.equal(isPushEndpoint('http://localhost:8791/p', {}), false);
ok('PUSH_ALLOWED_HOSTS añade dominios exactos solo si se define');
assert.throws(() => assertPushEndpoints([{ endpoint: 'https://evil.com/x' }], {}), (e) => e.status === 400);
assertPushEndpoints([{ p256dh: 'x' }, { endpoint: 'https://web.push.apple.com/a' }], {});
ok('assertPushEndpoints: 400 si alguna fila trae una dirección mala; filas sin endpoint pasan');
