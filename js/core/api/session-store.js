// Sesiones abiertas en este dispositivo: una por perfil y otra para los padres ("parent").
// Solo se guarda el identificador que da el Worker. Las de los perfiles duran 7 días sin usarse;
// la de padres solo vive mientras la app esté abierta (memoria temporal) y caduca a los 30 minutos sin usarse.
import { clearMemoryCache } from './memory-cache.js';
import { touchParentActivity } from './activity.js';

const PREFIX = 'aj.session.';

export const PARENT_OWNER = 'parent';

const storeFor = (owner) => (owner === PARENT_OWNER ? sessionStorage : localStorage);

export function getSession(owner) {
  try {
    return (owner && storeFor(owner).getItem(PREFIX + owner)) || '';
  } catch {
    return '';
  }
}

export function setSession(owner, token) {
  clearMemoryCache(true);
  if (owner === PARENT_OWNER) touchParentActivity();
  try {
    storeFor(owner).setItem(PREFIX + owner, token);
  } catch {
    /* sin almacenamiento: tendrá que entrar cada vez */
  }
}

export function clearSession(owner) {
  clearMemoryCache(true);
  try {
    storeFor(owner).removeItem(PREFIX + owner);
    localStorage.removeItem(PREFIX + PARENT_OWNER); // restos de versiones anteriores
  } catch {
    /* nada que borrar */
  }
}

export const hasSession = (owner) => Boolean(getSession(owner));
