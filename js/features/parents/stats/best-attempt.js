import { practiceOnly } from './practice-only.js';

/** Resumen de un tema para las tarjetas de la asignatura: la mejor sesión de ejercicios (ni el reto ni el mix cuentan). */
export function bestAttempt(sessions) {
  let best = null;
  for (const s of practiceOnly(sessions)) {
    if (!best || s.correct / s.total > best.correct / best.total) best = s;
  }
  return best ? { correct: best.correct, total: best.total } : null;
}
