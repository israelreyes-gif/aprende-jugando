import { HttpError } from './http.js';
import { fromBase64Url, toBase64Url } from './push-base64url.js';
import { derToRaw } from './passkey-der.js';
import { passkeyOrigins, passkeyRpId } from './passkey-config.js';

const bad = () => new HttpError(401, 'No se ha podido verificar');
const FLAG_UP = 0x01; // el usuario estaba presente
const FLAG_UV = 0x04; // el usuario se verificó (Face ID)

const sha256 = async (bytes) => new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));

/** Comprueba clientDataJSON (tipo, reto, origen) y authenticatorData (dominio, presencia y Face ID). Devuelve los bytes de clientDataJSON. */
export async function verifyClient(env, { type, challenge, clientDataJSON, authenticatorData }) {
  let client;
  let clientBytes;
  let auth;
  try {
    clientBytes = fromBase64Url(clientDataJSON);
    client = JSON.parse(new TextDecoder().decode(clientBytes));
    auth = fromBase64Url(authenticatorData);
  } catch {
    throw bad();
  }
  const rpId = passkeyRpId(env);
  if (!rpId || client.type !== type || client.challenge !== challenge || !passkeyOrigins(env).includes(client.origin)) throw bad();
  if (auth.length < 37) throw bad();
  const expected = await sha256(new TextEncoder().encode(rpId));
  if (!expected.every((b, i) => b === auth[i])) throw bad();
  if ((auth[32] & FLAG_UP) === 0 || (auth[32] & FLAG_UV) === 0) throw bad();
  return clientBytes;
}

const importKey = (spki) => crypto.subtle.importKey('spki', fromBase64Url(spki), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);

/** La clave pública enviada al registrar tiene que ser una P-256 válida (si no, no se guarda). */
export async function assertUsableKey(spki) {
  try { await importKey(spki); } catch { throw new HttpError(400, 'Clave no válida'); }
}

/** Comprueba la firma del inicio de sesión: firma(authenticatorData || SHA-256(clientDataJSON)). */
export async function verifySignature(spki, { authenticatorData, clientBytes, signature }) {
  try {
    const key = await importKey(spki);
    const data = new Uint8Array([...fromBase64Url(authenticatorData), ...(await sha256(clientBytes))]);
    const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, derToRaw(fromBase64Url(signature)), data);
    if (!ok) throw bad();
  } catch (err) {
    throw err instanceof HttpError ? err : bad();
  }
}

export const newChallenge = () => toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
