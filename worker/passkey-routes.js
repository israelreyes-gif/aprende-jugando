import { HttpError, json } from './http.js';
import { PARENT } from './auth-rules.js';
import { createSession, findSession } from './auth-sessions.js';
import { passkeyRpId } from './passkey-config.js';
import { deletePasskey, getPasskey, listPasskeys, saveChallenge, savePasskey, touchPasskey, useChallenge } from './passkey-store.js';
import { assertUsableKey, newChallenge, verifyClient, verifySignature } from './passkey-verify.js';

const MAX_PASSKEYS = 10;
const isId = (value) => typeof value === 'string' && /^[A-Za-z0-9_-]{16,512}$/.test(value);
const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

async function parentSession(db, request) {
  const session = await findSession(db, request.headers.get('X-Session') || '');
  if (session?.owner !== PARENT) throw new HttpError(401, 'Sesión no válida');
}

/** Rutas de Face ID / passkeys. Registrar y borrar piden sesión de padres; entrar no (y no toca el contador de fallos del código). */
export async function handlePasskey(request, env, action, body, cors) {
  const db = env.DB;
  const rpId = passkeyRpId(env);
  if (!rpId) throw new HttpError(500, 'Face ID no está configurado');

  if (action === 'passkey-list') {
    await parentSession(db, request);
    return json(await listPasskeys(db), 200, cors);
  }

  if (action === 'passkey-challenge') {
    const kind = body.kind === 'register' ? 'register' : 'login';
    if (kind === 'register') await parentSession(db, request);
    const challenge = newChallenge();
    await saveChallenge(db, challenge, kind);
    const known = kind === 'login' ? (await listPasskeys(db)).map((p) => p.id) : [];
    return json({ challenge, rpId, ...(kind === 'login' ? { allow: known } : {}) }, 200, cors);
  }

  if (action === 'passkey-register') {
    await parentSession(db, request);
    if (!isId(body.id) || typeof body.challenge !== 'string' || typeof body.publicKey !== 'string') throw new HttpError(400, 'Datos no válidos');
    if (!(await useChallenge(db, body.challenge, 'register'))) throw new HttpError(401, 'No se ha podido verificar');
    await verifyClient(env, { type: 'webauthn.create', challenge: body.challenge, clientDataJSON: body.clientDataJSON, authenticatorData: body.authenticatorData });
    await assertUsableKey(body.publicKey);
    if ((await listPasskeys(db)).filter((p) => p.id !== body.id).length >= MAX_PASSKEYS) throw new HttpError(400, 'Demasiados dispositivos');
    await savePasskey(db, body.id, body.publicKey, text(body.label, 60) || 'Mi móvil');
    return json({ ok: true }, 201, cors);
  }

  if (action === 'passkey-delete') {
    await parentSession(db, request);
    if (!isId(body.id)) throw new HttpError(400, 'Datos no válidos');
    await deletePasskey(db, body.id);
    return json({ ok: true }, 200, cors);
  }

  if (action === 'passkey-login') {
    if (!isId(body.id) || typeof body.challenge !== 'string') throw new HttpError(401, 'No se ha podido verificar');
    const key = await getPasskey(db, body.id);
    if (!key || !(await useChallenge(db, body.challenge, 'login'))) throw new HttpError(401, 'No se ha podido verificar');
    const clientBytes = await verifyClient(env, { type: 'webauthn.get', challenge: body.challenge, clientDataJSON: body.clientDataJSON, authenticatorData: body.authenticatorData });
    await verifySignature(key.public_key, { authenticatorData: body.authenticatorData, clientBytes, signature: body.signature });
    await touchPasskey(db, body.id);
    return json({ token: await createSession(db, PARENT) }, 200, cors);
  }

  throw new HttpError(404, 'Ruta no encontrada');
}
