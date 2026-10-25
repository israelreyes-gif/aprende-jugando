import { getSetting, saveSetting } from '../../../data/settings.repo.js';
import { randomSalt, sha256 } from './pin-hash.js';

// El PIN nunca se guarda: solo "sal:huella" en la tabla settings.
const PIN_KEY = 'parent_pin';

/** Devuelve el registro guardado ("sal:huella") o null si todavía no hay PIN. */
export function getStoredPin() {
  return getSetting(PIN_KEY);
}

export async function savePin(pin) {
  const salt = randomSalt();
  const hash = await sha256(`${salt}:${pin}`);
  await saveSetting(PIN_KEY, `${salt}:${hash}`);
}

export async function verifyPin(pin, stored) {
  const [salt, hash] = stored.split(':');
  return (await sha256(`${salt}:${pin}`)) === hash;
}
