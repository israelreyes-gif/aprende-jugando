import { addDays, spainDay } from './reminder-dates.js';
import { streakByDay } from './stats-streak.js';

/** Cada cuántos días de racha se gana un diamante, y cuántos se pueden tener guardados a la vez. */
export const SHIELD_EVERY = 30;
export const MAX_SHIELDS = 3;

/** Día (hora de España) en que se gastó el protector; si la fila no trae fecha de creación, el día siguiente al protegido. */
function usedOn(shield) {
  const at = shield.created_at ? new Date(shield.created_at) : null;
  return at && !Number.isNaN(at.getTime()) ? spainDay(at) : addDays(shield.day, 1);
}

/**
 * Protectores de un perfil: { earned, used, lost, available }, calculado recorriendo el historial en orden:
 * se gana uno cada vez que un reto hecho completa un múltiplo de 30 días de racha (con un máximo de 3 guardados:
 * si ya tiene 3, el nuevo se pierde) y se gasta uno el día en que se usa. Mismo resultado que guardar un contador,
 * pero sin que pueda descuadrarse. Copia de js/features/reto/shield/shield-balance.js (el Worker no puede importar archivos de la app).
 * doneDays: retos terminados · freeDays: días libres · shields: [{ day, created_at }] (días protegidos = protectores gastados).
 */
export function shieldBalance(doneDays, freeDays, shields) {
  const streakAt = streakByDay(doneDays, [...freeDays, ...shields.map((s) => s.day)]);
  const events = [];
  for (const [day, streak] of streakAt) if (streak % SHIELD_EVERY === 0) events.push({ day, delta: 1 });
  for (const shield of shields) events.push({ day: usedOn(shield), delta: -1 });
  events.sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : b.delta - a.delta)); // el mismo día, primero se gana y luego se gasta

  let held = 0;
  let earned = 0;
  let lost = 0;
  for (const event of events) {
    if (event.delta < 0) held = Math.max(0, held - 1);
    else if (held >= MAX_SHIELDS) { earned += 1; lost += 1; }
    else { earned += 1; held += 1; }
  }
  return { earned, used: new Set(shields.map((s) => s.day)).size, lost, available: held };
}
