import { getConnection } from '../core/api.js';

/** Pide al Worker que envíe un aviso. target: 'parents' o { profile_id }. message: { title, body, tag?, url? } */
export async function sendPush(target, message) {
  const { url, key } = getConnection();
  const response = await fetch(`${url}/push/send`, {
    method: 'POST',
    headers: { 'X-Api-Key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ target, ...message }),
  });
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
}
