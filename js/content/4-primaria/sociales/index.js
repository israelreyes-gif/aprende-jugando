// Temas de Sociales · 4.º de Primaria
// Cada tema es una carpeta con index.js, study.js y exercises.js.
export const topics = [
  { id: 'prehistoria-paleolitico', emoji: '🔥', minutes: 5, load: () => import('./prehistoria-paleolitico/index.js') },
  { id: 'neolitico', emoji: '🌾', minutes: 5, load: () => import('./neolitico/index.js') },
  { id: 'edad-metales', emoji: '⚒️', minutes: 5, load: () => import('./edad-metales/index.js') },
  { id: 'arte-prehistoria', emoji: '🎨', minutes: 5, load: () => import('./arte-prehistoria/index.js') },
  { id: 'cuevas-animales', emoji: '🗺️', minutes: 5, load: () => import('./cuevas-animales/index.js') },
];

/** Mix de preguntas de toda la asignatura (sin `unit`: mezcla todos los temas liberados y estudiados). */
export const mixes = [{ id: 'sociales', emoji: '🎲', title: 'Mix · Sociales', size: 36 }];
