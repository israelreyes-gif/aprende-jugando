import { POINTS } from './rules.js';

/**
 * Puntos de una sesión (ejercicios de un tema o reto completo).
 * Devuelve { right, wrong, base, bonus, total }: base = aciertos − fallos; el bonus es +5 si acaba en positivo y −5 si en negativo.
 */
export function sessionPoints(correct, total) {
  const wrong = total - correct;
  const base = correct * POINTS.correct + wrong * POINTS.wrong;
  const bonus = base > 0 ? POINTS.bonus : base < 0 ? -POINTS.bonus : 0;
  return { right: correct, wrong, base, bonus, total: base + bonus };
}
