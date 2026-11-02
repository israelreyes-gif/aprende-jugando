import { authRequest } from '../core/api/auth-request.js';
import { PARENT_OWNER, clearSession, getSession, setSession } from '../core/api/session-store.js';
import { clearReadCache } from '../core/api/cache-store.js';
import { flushOutbox } from '../core/api/outbox.js';

const PROFILES_CACHE = 'aj.profilesCache';

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_CACHE) || '[]');
  } catch {
    return [];
  }
};

/** Perfiles para la pantalla de inicio (sin entrar): nombre, color, si tiene código y si lo pide siempre. Sin conexión, la última copia. */
export async function fetchProfiles() {
  try {
    const profiles = await authRequest('GET', 'profiles');
    try {
      localStorage.setItem(PROFILES_CACHE, JSON.stringify(profiles));
    } catch {
      /* sin caché */
    }
    return profiles;
  } catch (err) {
    if (err.status === undefined || err.status >= 500) {
      const stale = readCache();
      if (stale.length) return stale;
    }
    throw err;
  }
}

/** ¿Este perfil pide el código cada vez que se abre su tarjeta? (según la última lista leída) */
export const asksAlways = (profileId) => Boolean(readCache().find((p) => p.id === profileId)?.ask_always);

/** { has_code, legacy }: si los padres ya tienen código y si queda el PIN antiguo por convertir. */
export const fetchParentStatus = () => authRequest('GET', 'parent');

/** Entra con el código. Guarda la sesión en este dispositivo. */
export async function login(owner, code) {
  const { token } = await authRequest('POST', 'login', { body: { owner, code } });
  setSession(owner, token);
  flushOutbox(); // lo que quedó guardado sin sesión se envía ahora
}

/** Crea el código de un perfil (primera vez) o de los padres (con el PIN antiguo, si lo hay) y entra (remember: false = no dejar la sesión abierta aquí). */
export async function createCode(owner, code, { pin, remember = true } = {}) {
  const { token } = await authRequest('POST', 'setup', { body: { owner, code, ...(pin ? { pin } : {}) } });
  if (!remember) return;
  setSession(owner, token);
  flushOutbox();
}

/** Cambia el código pidiendo el actual (los padres no lo necesitan para un perfil). */
export async function changeCode(owner, current, code) {
  const mine = getSession(owner) || getSession(PARENT_OWNER);
  const { token } = await authRequest('POST', 'change', { body: { owner, current, code }, token: mine });
  if (getSession(owner)) setSession(owner, token);
}

/** Quita el código de un perfil (solo padres): volverá a pedir uno nuevo. */
export const resetCode = (owner) => authRequest('POST', 'reset', { body: { owner }, token: getSession(PARENT_OWNER) });

/** Cierra la sesión de este dispositivo (la de un perfil o la de padres) y olvida lo leído. */
export async function logout(owner) {
  const token = getSession(owner);
  clearSession(owner);
  clearReadCache();
  if (token) await authRequest('POST', 'logout', { body: {}, token }).catch(() => {});
}
