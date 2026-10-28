/** Los 10 niveles: puntos mínimos para alcanzar cada uno. */
export const LEVELS = [
  { n: 1, name: 'Explorador', emoji: '🌱', min: 0 },
  { n: 2, name: 'Aprendiz', emoji: '📘', min: 50 },
  { n: 3, name: 'Curioso', emoji: '🧐', min: 120 },
  { n: 4, name: 'Aventurero', emoji: '🧭', min: 220 },
  { n: 5, name: 'Detective', emoji: '🔍', min: 350 },
  { n: 6, name: 'Inventor', emoji: '💡', min: 520 },
  { n: 7, name: 'Experto', emoji: '🚀', min: 750 },
  { n: 8, name: 'Campeón', emoji: '🏆', min: 1050 },
  { n: 9, name: 'Maestro', emoji: '🎓', min: 1450 },
  { n: 10, name: 'Leyenda', emoji: '👑', min: 2000 },
];

/** Nivel de un total de puntos: { ...nivel, next, toNext, progress } (progress: 0-100 hacia el siguiente). */
export function levelFor(total) {
  const points = Math.max(0, total);
  let index = 0;
  LEVELS.forEach((level, i) => {
    if (points >= level.min) index = i;
  });
  const current = LEVELS[index];
  const next = LEVELS[index + 1] || null;
  const progress = next ? Math.round(((points - current.min) * 100) / (next.min - current.min)) : 100;
  return { ...current, next, toNext: next ? next.min - points : 0, progress };
}
