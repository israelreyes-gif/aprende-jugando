import { HttpError } from './http.js';

export const PARENT = 'parent';
export const SESSION_DAYS = 7;
export const PARENT_IDLE_MINUTES = 30; // los padres caducan antes: 30 minutos sin usar

/** Perfiles: de 4 a 8 cifras. Padres: de 6 a 8. */
export function assertValidCode(code, owner) {
  const min = owner === PARENT ? 6 : 4;
  if (typeof code !== 'string' || !new RegExp(`^\\d{${min},8}$`).test(code)) {
    throw new HttpError(400, `El código debe tener entre ${min} y 8 números`);
  }
}
