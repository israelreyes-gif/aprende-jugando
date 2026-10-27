import { fromBase64Url, toBase64Url } from './push-base64url.js';

const TWELVE_HOURS_S = 12 * 60 * 60;
const encoder = new TextEncoder();

/** Importa la clave privada VAPID (el valor "d" en base64url) usando la pública para sacar x e y. */
async function importPrivateKey(privateKey, publicKey) {
  const raw = fromBase64Url(publicKey);
  const jwk = { kty: 'EC', crv: 'P-256', x: toBase64Url(raw.slice(1, 33)), y: toBase64Url(raw.slice(33, 65)), d: privateKey, ext: true };
  return crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
}

/** Cabecera Authorization (VAPID) para enviar un aviso a ese endpoint. Demuestra que el aviso viene de esta app. */
export async function vapidAuthorization(endpoint, env, nowMs = Date.now()) {
  const claims = { aud: new URL(endpoint).origin, exp: Math.floor(nowMs / 1000) + TWELVE_HOURS_S, sub: env.VAPID_SUBJECT };
  const header = toBase64Url(encoder.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const body = toBase64Url(encoder.encode(JSON.stringify(claims)));
  const key = await importPrivateKey(env.VAPID_PRIVATE_KEY, env.VAPID_PUBLIC_KEY);
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, encoder.encode(`${header}.${body}`));
  return `vapid t=${header}.${body}.${toBase64Url(new Uint8Array(signature))}, k=${env.VAPID_PUBLIC_KEY}`;
}
