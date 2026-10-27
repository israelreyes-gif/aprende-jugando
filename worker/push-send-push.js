import { encryptPayload } from './push-encrypt.js';
import { vapidAuthorization } from './push-vapid.js';

/**
 * Envía un aviso a un móvil. message = { title, body, tag?, url? }.
 * Devuelve { ok, gone, status }: gone = true si el móvil ya no existe (hay que borrarlo).
 */
export async function sendPush(device, message, env) {
  try {
    const body = await encryptPayload(device, JSON.stringify(message));
    const response = await fetch(device.endpoint, {
      method: 'POST',
      headers: {
        Authorization: await vapidAuthorization(device.endpoint, env),
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        TTL: '86400',
        Urgency: 'normal',
      },
      body,
    });
    return { ok: response.ok, gone: response.status === 404 || response.status === 410, status: response.status };
  } catch (err) {
    return { ok: false, gone: false, status: 0, error: String(err?.message || err) };
  }
}
