import { fromBase64Url } from './push-base64url.js';

const encoder = new TextEncoder();
const RECORD_SIZE = 4096;

async function hkdf(salt, secret, info, length) {
  const key = await crypto.subtle.importKey('raw', secret, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, length * 8));
}

const concat = (...parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const part of parts) (out.set(part, at), (at += part.length));
  return out;
};

/**
 * Cifra el texto del aviso para un móvil (Web Push, RFC 8291, aes128gcm).
 * subscription = { p256dh, auth } en base64url. `ephemeral` y `salt` solo se pasan en las pruebas.
 */
export async function encryptPayload(subscription, text, { ephemeral, salt } = {}) {
  const uaPublic = fromBase64Url(subscription.p256dh);
  const authSecret = fromBase64Url(subscription.auth);
  const pair = ephemeral || (await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']));
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, pair.privateKey, 256));

  const keyInfo = concat(encoder.encode('WebPush: info\0'), uaPublic, asPublic);
  const ikm = await hkdf(authSecret, shared, keyInfo, 32);
  const recordSalt = salt || crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(recordSalt, ikm, encoder.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(recordSalt, ikm, encoder.encode('Content-Encoding: nonce\0'), 12);

  const plain = concat(encoder.encode(text), Uint8Array.of(2));
  const aes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aes, plain));

  const header = new Uint8Array(21);
  header.set(recordSalt, 0);
  new DataView(header.buffer).setUint32(16, RECORD_SIZE);
  header[20] = asPublic.length;
  return concat(header, asPublic, cipher);
}
