import { pctOf, sum } from './math.js';
import { REINFORCE_LAST_ATTEMPTS } from './thresholds.js';

/** Porcentaje de aciertos de los últimos intentos de un tema (null si no hay ninguno). */
export function recentPct(sessions) {
  const latest = sessions
    .slice()
    .sort((a, b) => new Date(b.finished_at) - new Date(a.finished_at))
    .slice(0, REINFORCE_LAST_ATTEMPTS);
  return pctOf(sum(latest, 'correct'), sum(latest, 'total'));
}
