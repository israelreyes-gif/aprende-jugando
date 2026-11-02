/** Los 20 niveles: puntos mínimos para alcanzar cada uno. name: masculino; fem: femenino. */
export const LEVELS = [
  { n: 1, name: 'Explorador', fem: 'Exploradora', emoji: '🌱', min: 0 },
  { n: 2, name: 'Aprendiz', fem: 'Aprendiz', emoji: '📘', min: 50 },
  { n: 3, name: 'Curioso', fem: 'Curiosa', emoji: '🧐', min: 120 },
  { n: 4, name: 'Aventurero', fem: 'Aventurera', emoji: '🧭', min: 220 },
  { n: 5, name: 'Detective', fem: 'Detective', emoji: '🔍', min: 350 },
  { n: 6, name: 'Inventor', fem: 'Inventora', emoji: '💡', min: 520 },
  { n: 7, name: 'Experto', fem: 'Experta', emoji: '🚀', min: 750 },
  { n: 8, name: 'Campeón', fem: 'Campeona', emoji: '🏆', min: 1050 },
  { n: 9, name: 'Maestro', fem: 'Maestra', emoji: '🎓', min: 1450 },
  { n: 10, name: 'Leyenda', fem: 'Leyenda', emoji: '👑', min: 2000 },
  { n: 11, name: 'Sabio', fem: 'Sabia', emoji: '🦉', min: 2700 },
  { n: 12, name: 'Genio', fem: 'Genia', emoji: '🧠', min: 3500 },
  { n: 13, name: 'Pionero', fem: 'Pionera', emoji: '🔭', min: 4400 },
  { n: 14, name: 'Héroe', fem: 'Heroína', emoji: '🦸', min: 5400 },
  { n: 15, name: 'Gran Maestro', fem: 'Gran Maestra', emoji: '🥋', min: 6500 },
  { n: 16, name: 'Titán', fem: 'Titana', emoji: '⚡', min: 7700 },
  { n: 17, name: 'Gladiador', fem: 'Gladiadora', emoji: '🛡️', min: 9000 },
  { n: 18, name: 'Guardián', fem: 'Guardiana', emoji: '🏰', min: 10500 },
  { n: 19, name: 'Dragón', fem: 'Dragón', emoji: '🐉', min: 12200 },
  { n: 20, name: 'Inmortal', fem: 'Inmortal', emoji: '🌟', min: 14000 },
];

/** Los niveles con el nombre según el género ('chica' → femenino; cualquier otro valor → masculino). */
export function levelsFor(gender) {
  return LEVELS.map((level) => ({ ...level, name: gender === 'chica' ? level.fem : level.name }));
}

/** Nivel de un total de puntos: { ...nivel, next, toNext, progress } (progress: 0-100 hacia el siguiente). */
export function levelFor(total, gender) {
  const levels = levelsFor(gender);
  const points = Math.max(0, total);
  let index = 0;
  levels.forEach((level, i) => {
    if (points >= level.min) index = i;
  });
  const current = levels[index];
  const next = levels[index + 1] || null;
  const progress = next ? Math.round(((points - current.min) * 100) / (next.min - current.min)) : 100;
  return { ...current, next, toNext: next ? next.min - points : 0, progress };
}
