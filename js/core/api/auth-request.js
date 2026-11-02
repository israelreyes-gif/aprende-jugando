import { getConnection } from './connection.js';
import { fetchWithTimeout } from './fetch-timeout.js';

/** Una petición a /auth/* del Worker (con la clave de la app). Lanza un Error con .status, .left y .retryIn si algo falla. */
export async function authRequest(method, action, { body, token } = {}) {
  const { url, key } = getConnection();
  if (!url || !key) throw Object.assign(new Error('La app no está conectada'), { status: 0, code: 'not-configured' });

  const response = await fetchWithTimeout(`${url}/auth/${action}`, {
    method,
    headers: { 'X-Api-Key': key, ...(token ? { 'X-Session': token } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await response.json();
  } catch {
    /* sin cuerpo JSON */
  }
  if (!response.ok) {
    throw Object.assign(new Error(data?.error || `Error ${response.status}`), { status: response.status, left: data?.left, retryIn: data?.retry_in });
  }
  return data;
}
