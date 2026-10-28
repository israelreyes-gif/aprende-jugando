import { pointsOutcome } from '../points-outcome.js';
import { announceLevelUp } from './announce-level-up.js';

/**
 * Cuando una sesión ya está guardada: rellena el total del bloque de puntos y, si sube de nivel, lo celebra.
 * Nunca lanza error: los puntos son un extra y no deben romper el resultado.
 */
export async function reportPoints({ profile, delta, queued, burst }) {
  try {
    const outcome = await pointsOutcome({ profileId: profile.id, delta, queued });
    if (!outcome) return;
    burst?.setTotal(outcome.total);
    if (outcome.up) await announceLevelUp({ profile, level: outcome.up });
  } catch (err) {
    console.warn('No se pudieron mostrar los puntos', err);
  }
}
