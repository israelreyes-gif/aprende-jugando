import { streakByDay } from '../streak/streak-by-day.js';

/** Cada cuántos días de racha se gana un protector. */
export const SHIELD_EVERY = 10;

/**
 * Protectores de un perfil: { earned, used, available }.
 * Se gana uno cada vez que un reto hecho completa un múltiplo de 10 días de racha; cada día protegido gasta uno.
 * Copia en worker/shield-balance.js (el Worker no puede importar archivos de la app).
 * doneDays: retos terminados · freeDays: días libres · shieldDays: días protegidos (los protectores gastados).
 */
export function shieldBalance(doneDays, freeDays, shieldDays) {
  const used = new Set(shieldDays).size;
  const streakAt = streakByDay(doneDays, [...freeDays, ...shieldDays]);
  let earned = 0;
  for (const streak of streakAt.values()) if (streak % SHIELD_EVERY === 0) earned += 1;
  return { earned, used, available: Math.max(0, earned - used) };
}
