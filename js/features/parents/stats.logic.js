// Lógica pura de estadísticas: sin DOM ni red, fácil de probar. Cada pieza vive en stats/.
export { computeStats } from './stats/compute-stats.js';
export { bestAttempt } from './stats/best-attempt.js';
export { REINFORCE_BELOW, REINFORCE_LAST_ATTEMPTS, ACTIVE_DAYS_WINDOW } from './stats/thresholds.js';
