// Lógica pura de estadísticas: sin DOM ni red, fácil de probar. Cada pieza vive en stats/.
export { computeStats } from './stats/compute-stats.js';
export { bestAttempt } from './stats/best-attempt.js';
export { courseProgress } from './stats/course-progress.js';
export { topicStats } from './stats/topic-stats.js';
export { recentPct } from './stats/recent-pct.js';
export { reinforceLevel } from './stats/reinforce-level.js';
export { REINFORCE_BELOW, REINFORCE_RED_BELOW, REINFORCE_LAST_ATTEMPTS, ACTIVE_DAYS_WINDOW } from './stats/thresholds.js';
