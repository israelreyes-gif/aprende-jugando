import { HttpError } from './http.js';

export const PARENT = 'parent';
export const SESSION_DAYS = 7;

/** Perfiles: de 4 a 8 cifras. Padres: de 6 a 8. */
export function assertValidCode(code, owner) {
  const min = owner === PARENT ? 6 : 4;
  if (typeof code !== 'string' || !new RegExp(`^\\d{${min},8}$`).test(code)) {
    throw new HttpError(400, `El código debe tener entre ${min} y 8 números`);
  }
}
