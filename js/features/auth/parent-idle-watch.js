import { parentIdleMs } from '../../core/api/activity.js';
import { PARENT_OWNER, clearSession, hasSession } from '../../core/api/session-store.js';
import { currentPath } from '../../core/router.js';
import { toLogin } from './auth-guard.js';
import { announceExpiry } from './session-expired.js';

const IDLE_MS = 30 * 60 * 1000; // igual que PARENT_IDLE_MINUTES del Worker
const CHECK_MS = 15 * 1000;

const inParentArea = (path) => path.startsWith('/parents') || path === '/new-profile';

/** Si pasan 30 min sin tocar la zona de padres, avisa de la caducidad aunque no haya habido ninguna petición. */
export function checkParentIdle() {
  if (!hasSession(PARENT_OWNER) || parentIdleMs() < IDLE_MS) return;
  clearSession(PARENT_OWNER);
  const path = currentPath();
  if (inParentArea(path)) announceExpiry(PARENT_OWNER, toLogin(path, PARENT_OWNER));
}

export function watchParentIdle() {
  const timer = setInterval(checkParentIdle, CHECK_MS);
  timer.unref?.(); // en el navegador es un número y no hace nada; en las pruebas (Node) evita que el temporizador impida terminar
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && checkParentIdle());
}
