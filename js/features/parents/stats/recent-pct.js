import { pctOf } from './math.js';
import { REINFORCE_LAST_QUESTIONS } from './thresholds.js';

/**
 * Porcentaje de aciertos de las últimas preguntas de un tema (null si no hay ninguna).
 * Se recorren las sesiones de la más reciente a la más antigua hasta reunir REINFORCE_LAST_QUESTIONS preguntas.
 * Una sesión de 8 pesa 8; una del reto (1 o 2 preguntas) pesa solo lo que tiene.
 * Si la última sesión no cabe entera, se cuenta la parte que falta en proporción.
 * sessions: practice_sessions de un tema, de ejercicios y de reto.
 */
export function recentPct(sessions) {
  const newestFirst = sessions.slice().sort((a, b) => new Date(b.finished_at) - new Date(a.finished_at));
  let asked = 0;
  let correct = 0;
  for (const s of newestFirst) {
    if (asked >= REINFORCE_LAST_QUESTIONS) break;
    const take = Math.min(s.total, REINFORCE_LAST_QUESTIONS - asked);
    correct += (s.correct * take) / s.total;
    asked += take;
  }
  return pctOf(correct, asked);
}
