import { SHIELD_EVERY } from './shield-balance.js';

/** Siguiente racha que da un diamante y cuánto falta, en proporción de 0 a 1. */
export function diamondProgress(streak) {
  const nextAt = (Math.floor(streak / SHIELD_EVERY) + 1) * SHIELD_EVERY;
  return { nextAt, ratio: (streak % SHIELD_EVERY) / SHIELD_EVERY };
}
