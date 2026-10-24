import { getConnection } from './connection.js';
import { buildQuery } from './query.js';

/** Una petición al Worker. Lanza un Error con .status si algo falla. */
export async function request(method, path, { query, body } = {}) {
  const { url, key } = getConnection();
  if (!url || !key) throw Object.assign(new Error('La app no está conectada'), { status: 0, code: 'not-configured' });

  const response = await fetch(`${url}/api/${path}${buildQuery(query)}`, {
    method,
    headers: { 'X-Api-Key': key, ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let detail = '';
    try {
      detail = (await response.json()).error || '';
    } catch {
      /* sin cuerpo JSON */
    }
    throw Object.assign(new Error(detail || `Error ${response.status}`), { status: response.status });
  }
  return response.json();
}

export const insertRows = (table, rows, conflict) => request('POST', table, { query: { conflict }, body: rows });
