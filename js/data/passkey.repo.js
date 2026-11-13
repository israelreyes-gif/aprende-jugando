import { authRequest } from '../core/api/auth-request.js';
import { getSession, setSession, PARENT_OWNER } from '../core/api/session-store.js';
import { flushOutbox } from '../core/api/outbox.js';
import { fromBase64Url, toBase64Url } from '../core/webauthn/base64url.js';
import { setLocalPasskey } from '../core/webauthn/support.js';

const parentToken = () => getSession(PARENT_OWNER);
const call = (action, body = {}, token) => authRequest('POST', action, { body, token });

/** Activa Face ID en este móvil (hay que haber entrado ya como padre). */
export async function registerPasskey(label) {
  const token = parentToken();
  const { challenge, rpId } = await call('passkey-challenge', { kind: 'register' }, token);
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: fromBase64Url(challenge),
      rp: { id: rpId, name: 'Aprende y juega' },
      user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'padres', displayName: 'Padres' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', residentKey: 'preferred', userVerification: 'required' },
      timeout: 60000,
      attestation: 'none',
    },
  });
  const response = credential.response;
  await call('passkey-register', {
    id: toBase64Url(credential.rawId), challenge, label,
    publicKey: toBase64Url(response.getPublicKey()),
    clientDataJSON: toBase64Url(response.clientDataJSON),
    authenticatorData: toBase64Url(response.getAuthenticatorData()),
  }, token);
  setLocalPasskey(true);
}

/** Entra como padre con Face ID. Guarda la sesión como si hubiera escrito el código. */
export async function loginWithPasskey() {
  const { challenge, rpId, allow } = await call('passkey-challenge', { kind: 'login' });
  const credential = await navigator.credentials.get({
    publicKey: {
      challenge: fromBase64Url(challenge), rpId, userVerification: 'required', timeout: 60000,
      allowCredentials: allow.map((id) => ({ type: 'public-key', id: fromBase64Url(id) })),
    },
  });
  const response = credential.response;
  const { token } = await call('passkey-login', {
    id: toBase64Url(credential.rawId), challenge,
    clientDataJSON: toBase64Url(response.clientDataJSON),
    authenticatorData: toBase64Url(response.authenticatorData),
    signature: toBase64Url(response.signature),
  });
  setSession(PARENT_OWNER, token);
  flushOutbox();
}

export const listPasskeys = () => call('passkey-list', {}, parentToken());
export const deletePasskey = (id) => call('passkey-delete', { id }, parentToken());
