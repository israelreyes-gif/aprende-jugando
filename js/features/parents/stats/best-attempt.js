/** Resumen de un tema para las tarjetas de la asignatura: la mejor sesión. */
export function bestAttempt(sessions) {
  let best = null;
  for (const s of sessions) {
    if (!best || s.correct / s.total > best.correct / best.total) best = s;
  }
  return best ? { correct: best.correct, total: best.total } : null;
}
