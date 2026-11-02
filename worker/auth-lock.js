export const FAILS_PER_ROUND = 5;
const LOCK_SECONDS = [60, 300, 900]; // 1 min, 5 min y 15 min como máximo

/** Segundos de bloqueo que toca tras llenar la ronda número `level` (1, 2, 3…). */
export const lockSeconds = (level) => LOCK_SECONDS[Math.min(level, LOCK_SECONDS.length) - 1];

/** Segundos que faltan para que se abra el acceso (0 si no está bloqueado). */
export function remainingLock(lockedUntil, now = Date.now()) {
  if (!lockedUntil) return 0;
  return Math.max(0, Math.ceil((Date.parse(lockedUntil) - now) / 1000));
}
