import { HttpError } from './http.js';

/** Ningún perfil puede llamarse 'parent' (en ninguna mayúscula, con o sin espacios): es el nombre interno de los padres. */
export function assertProfileNames(rows) {
  for (const row of rows) {
    if (row?.name === undefined) continue;
    if (typeof row.name !== 'string') throw new HttpError(400, 'Nombre no válido');
    if (row.name.trim().toLowerCase() === 'parent') throw new HttpError(400, 'Ese nombre no se puede usar');
  }
}
