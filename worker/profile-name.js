import { HttpError } from './http.js';

/** Ningún perfil puede llamarse 'parent' (en ninguna mayúscula, con o sin espacios): es el nombre interno de los padres. */
export function assertProfileNames(rows) {
  for (const row of rows) {
    if (typeof row?.name === 'string' && row.name.trim().toLowerCase() === 'parent') {
      throw new HttpError(400, 'Ese nombre no se puede usar');
    }
  }
}
