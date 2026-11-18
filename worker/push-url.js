import { HttpError } from './http.js';

const MAX_URL = 200;

/** Solo valen rutas internas de la app: '#/parents', '#/p/ID/c/CURSO/reto'. Sin url devuelve undefined. */
export function cleanPushUrl(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const valid = typeof value === 'string' && value.length <= MAX_URL && /^#\/[^\s\u0000-\u001f\u007f\\]*$/.test(value);
  if (!valid) throw new HttpError(400, 'url no válida');
  return value;
}
