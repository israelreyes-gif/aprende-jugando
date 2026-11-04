import { getConnection } from './connection.js';
import { buildQuery } from './query.js';
import { fetchWithTimeout } from './fetch-timeout.js';
import { clearSession } from './session-store.js';
import { pickSession } from './session-token.js';
import { clearMemoryCache } from './memory-cache.js';

export const SESSION_ERROR = 'Sesión no válida';

/** Una petición al Worker. Lanza un Error con .status si algo falla; code 'auth' si hay que volver a entrar con el código. */
export async function request(method, path, { query, body, owner } = {}) {
  const { url, key } = getConnection();
  if (!url || !key) throw Object.assign(new Error('La app no está conectada'), { status: 0, code: 'not-configured' });

  const session = pickSession(path, query, body, owner);
  const response = await fetchWithTimeout(`${url}/api/${path}${buildQuery(query)}`, {
    method,
    headers: {
      'X-Api-Key': key,
      ...(session.token ? { 'X-Session': session.token } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let detail = '';
    try {
      detail = (await response.json()).error || '';
    } catch {
      /* sin cuerpo JSON */
    }
    const error = Object.assign(new Error(detail || `Error ${response.status}`), { status: response.status });
    if (response.status === 401 && detail === SESSION_ERROR) {
      if (session.token) clearSession(session.owner);
      Object.assign(error, { code: 'auth', owner: session.owner });
    }
    throw error;
  }
  if (method !== 'GET') clearMemoryCache(); // tras escribir, las copias en memoria ya no valen
  return response.json();
}

export const insertRows = (table, rows, conflict, owner) => request('POST', table, { query: { conflict }, body: rows, owner });
