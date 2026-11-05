import { listSessions } from '../../data/practice.repo.js';
import { listStudied } from '../../data/study.repo.js';
import { api } from '../../core/api.js';
import { summarizePoints } from './summarize-points.js';

/** Puntos de un perfil, calculados con sus sesiones y temas estudiados. Lanza error si no se puede leer. */
export async function loadPoints(profileId) {
  try {
    const summary = await api.points(profileId); // lo calcula el Worker: una sola petición pequeña
    return { ...summary, byDay: new Map(Object.entries(summary.byDay)) };
  } catch (err) {
    if (err.code === 'auth') throw err;
    // Worker sin esta ruta todavía (o fallo): se calcula aquí con las sesiones, como antes
  }
  const [sessions, studied] = await Promise.all([listSessions(profileId), listStudied(profileId)]);
  return summarizePoints({ sessions, studied });
}

/** Igual, pero devuelve null si no se pudo leer (para pantallas que funcionan sin los puntos). */
export const loadPointsOrNull = (profileId) => loadPoints(profileId).catch(() => null);
