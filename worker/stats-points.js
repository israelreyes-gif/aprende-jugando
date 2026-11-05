import { HttpError, json } from './http.js';
import { PARENT } from './auth-rules.js';
import { summarizePointsJson } from './stats-summarize.js';

/**
 * GET /api/stats/points?profile_id=eq.<id> -> puntos de ese perfil ya calculados (sin bajar todas las sesiones al móvil).
 * Un perfil solo puede pedir los suyos; los padres, los de cualquiera.
 */
export async function handleStatsPoints(request, env, parts, cors, session) {
  if (request.method !== 'GET' || parts.length !== 3) throw new HttpError(404, 'Ruta no encontrada');
  const raw = new URL(request.url).searchParams.get('profile_id') || '';
  const profileId = raw.startsWith('eq.') ? raw.slice(3) : '';
  if (!profileId) throw new HttpError(400, 'Falta profile_id');
  if (session.owner !== PARENT && session.owner !== profileId) throw new HttpError(403, 'Operación no permitida');

  const [sessions, studied] = await Promise.all([
    env.DB.prepare('SELECT id, kind, correct, total, finished_at FROM practice_sessions WHERE profile_id = ?').bind(profileId).all(),
    env.DB.prepare('SELECT completed_at FROM study_progress WHERE profile_id = ?').bind(profileId).all(),
  ]);
  return json(summarizePointsJson({ sessions: sessions.results, studied: studied.results }), 200, cors);
}
