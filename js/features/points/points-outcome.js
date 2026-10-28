import { levelFor } from './levels.js';
import { getProfile } from '../../data/profiles.repo.js';
import { loadPoints } from './load-points.js';

/**
 * Tras ganar (o perder) delta puntos: total actual y, si ha subido de nivel, el nivel nuevo.
 * queued: la sesión se guardó solo en el móvil (sin conexión), así que la lectura aún no la incluye.
 * Devuelve { total, up } o null si no se pudo leer.
 */
export async function pointsOutcome({ profileId, delta, queued }) {
  try {
    const [summary, profile] = await Promise.all([loadPoints(profileId), getProfile(profileId).catch(() => null)]);
    const gender = profile ? profile.gender : null;
    const raw = queued ? summary.raw + delta : summary.raw;
    const after = levelFor(Math.max(0, raw), gender);
    const before = levelFor(Math.max(0, raw - delta), gender);
    return { total: Math.max(0, raw), up: after.n > before.n ? after : null };
  } catch (err) {
    console.warn('No se pudieron leer los puntos', err);
    return null;
  }
}
