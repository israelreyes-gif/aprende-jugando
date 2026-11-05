// Reglas de puntos en el servidor. MANTENER IGUAL que js/features/points/{rules,session-points,summarize-points}.js
// (hay una prueba, tests/test-stats-points.mjs, que compara las dos versiones con los mismos datos).
export const POINTS = { correct: 1, wrong: -1, studied: 10, bonus: 5 };

export function sessionPoints(correct, total) {
  const wrong = total - correct;
  const base = correct * POINTS.correct + wrong * POINTS.wrong;
  const bonus = base > 0 ? POINTS.bonus : base < 0 ? -POINTS.bonus : 0;
  return { right: correct, wrong, base, bonus, total: base + bonus };
}

/** Día en España como 'AAAA-MM-DD'. */
export const spainDay = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
