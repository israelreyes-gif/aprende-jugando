import { REINFORCE_BELOW, REINFORCE_RED_BELOW } from './thresholds.js';

/** Nivel de refuerzo según el porcentaje: 'red' (muy flojo), 'orange' (cerca del umbral) o null (va bien o sin datos). */
export function reinforceLevel(pct) {
  if (pct == null) return null;
  if (pct < REINFORCE_RED_BELOW) return 'red';
  if (pct < REINFORCE_BELOW) return 'orange';
  return null;
}
