import { HttpError } from './http.js';

// 'parent' es el dueño de las sesiones y del código de los padres: ningún perfil puede llamarse así.
const RESERVED = 'parent';

/** Un id de perfil son letras, números, guion y guion bajo (hasta 64) y no puede ser el de los padres. */
export function assertProfileIds(rows) {
  for (const row of rows) {
    if (row?.id === undefined) continue;
    const valid = typeof row.id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(row.id) && row.id.toLowerCase() !== RESERVED;
    if (!valid) throw new HttpError(400, 'Identificador de perfil no válido');
  }
}
