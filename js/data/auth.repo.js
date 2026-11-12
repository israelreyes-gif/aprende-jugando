import { authRequest } from '../core/api/auth-request.js';
import { PARENT_OWNER, clearSession, getSession, setSession } from '../core/api/session-store.js';
import { clearReadCache } from '../core/api/cache-store.js';
import { PROFILES_KEY, currentEpoch, getEntry, setEntry, FRESH_MS } from '../core/api/memory-cache.js';
import { emitDataEvent } from '../core/api/data-events.js';
import { flushOutbox } from '../core/api/outbox.js';

const PROFILES_CACHE = 'aj.profilesCache';

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_CACHE) || '[]');
  } catch {
    return [];
  }
};

async function fetchProfilesFromServer() {
  const epoch = currentEpoch();
  try {
    const profiles = await authRequest('GET', 'profiles');
    if (epoch === currentEpoch()) setEntry(PROFILES_KEY, profiles);
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

/**
 * Perfiles para la pantalla de inicio (sin entrar): nombre, color, si tiene código y si lo pide siempre.
 * Si ya se vieron (o hay copia en el dispositivo al abrir la app) se devuelven al instante y se refrescan detrás.
 * Sin conexión, la última copia.
 */
export async function fetchProfiles() {
  let hit = getEntry(PROFILES_KEY);
  if (!hit && currentEpoch() === 0) {
    const onDevice = readCache();
    if (onDevice.length) hit = { data: onDevice, at: 0 };
  }
  if (!hit) return fetchProfilesFromServer();
  if (Date.now() - hit.at > FRESH_MS) {
    fetchProfilesFromServer()
      .then((data) => JSON.stringify(data) !== JSON.stringify(hit.data) && emitDataEvent('changed'))
      .catch(() => {});
  }
  return hit.data;
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
  const token0 = owner === PARENT_OWNER ? undefined : getSession(PARENT_OWNER); // el código de un perfil lo pone un padre con su sesión
  const { token } = await authRequest('POST', 'setup', { body: { owner, code, ...(pin ? { pin } : {}) }, token: token0 });
  if (!remember || !token) return;
  setSession(owner, token);
  flushOutbox();
}

/** Cambia el código pidiendo el actual (los padres no lo necesitan para un perfil). */
export async function changeCode(owner, current, code) {
  const mine = getSession(owner) || getSession(PARENT_OWNER);
  const { token } = await authRequest('POST', 'change', { body: { owner, current, code }, token: mine });
  if (getSession(owner)) setSession(owner, token);
}

/** Pone un código nuevo a un perfil (solo padres, sin saber el actual). Cierra las sesiones que ese perfil tuviera abiertas. */
export const setProfileCode = (owner, code) => authRequest('POST', 'change', { body: { owner, code }, token: getSession(PARENT_OWNER) });

/** Cierra la sesión de este dispositivo (la de un perfil o la de padres) y olvida lo leído. */
export async function logout(owner) {
  const token = getSession(owner);
  clearSession(owner);
  clearReadCache();
  if (token) await authRequest('POST', 'logout', { body: {}, token }).catch(() => {});
}
