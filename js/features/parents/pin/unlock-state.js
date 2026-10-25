import { PARENTS_UNLOCK_MINUTES } from '../../../config.js';

// La zona de padres queda desbloqueada unos minutos (solo mientras la pestaña esté abierta).
const UNLOCK_KEY = 'aj.parentsUnlockedUntil';

export function isUnlocked() {
  return Number(sessionStorage.getItem(UNLOCK_KEY) || 0) > Date.now();
}

export function unlock() {
  sessionStorage.setItem(UNLOCK_KEY, String(Date.now() + PARENTS_UNLOCK_MINUTES * 60_000));
}

export function lock() {
  sessionStorage.removeItem(UNLOCK_KEY);
}
