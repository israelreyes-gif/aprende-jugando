import { getConnection } from '../core/api.js';
import { pickSession } from '../core/api/session-token.js';

/** Pide al Worker que envíe un aviso. target: 'parents' o { profile_id }. message: { title, body, tag?, url? } */
export async function sendPush(target, message) {
  const { url, key } = getConnection();
  const { token } = pickSession('push', null, typeof target === 'object' ? target : null);
  const response = await fetch(`${url}/push/send`, {
    method: 'POST',
    headers: { 'X-Api-Key': key, ...(token ? { 'X-Session': token } : {}), 'Content-Type': 'application/json' },
    body: JSON.stringify({ target, ...message }),
  });
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
}
