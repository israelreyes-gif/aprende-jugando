// Sesiones abiertas en este dispositivo: una por perfil y otra para los padres ("parent").
// Solo se guarda el identificador que da el Worker; caduca en el servidor a los 7 días sin usarse.
const PREFIX = 'aj.session.';

export const PARENT_OWNER = 'parent';

export function getSession(owner) {
  try {
    return (owner && localStorage.getItem(PREFIX + owner)) || '';
  } catch {
    return '';
  }
}

export function setSession(owner, token) {
  try {
    localStorage.setItem(PREFIX + owner, token);
  } catch {
    /* sin almacenamiento: tendrá que entrar cada vez */
  }
}

export function clearSession(owner) {
  try {
    localStorage.removeItem(PREFIX + owner);
  } catch {
    /* nada que borrar */
  }
}

export const hasSession = (owner) => Boolean(getSession(owner));
