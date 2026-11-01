// Temas de Matemáticas · 4.º de Primaria
// Cada tema es una carpeta con index.js, study.js y exercises.js.
// Un tema sin `load` aparece como "Pronto".
export const topics = [
  { id: 'numeros', emoji: '🔢', minutes: 6, load: () => import('./numeros/index.js') },
  { id: 'romanos', emoji: '🏛️', minutes: 5, load: () => import('./romanos/index.js') },
  { id: 'pares', emoji: '👯', minutes: 4, load: () => import('./pares/index.js') },
  { id: 'redondear', emoji: '🎯', minutes: 5, load: () => import('./redondear/index.js') },
  { id: 'tablas', emoji: '✖️', minutes: 5, load: () => import('./tablas/index.js') },
  { id: 'descomponer', emoji: '🧩', minutes: 6, load: () => import('./descomponer/index.js') },
  { id: 'cajitas', emoji: '📦', minutes: 5, load: () => import('./cajitas/index.js') },
  { id: 'relacionar', emoji: '🔗', minutes: 5, load: () => import('./relacionar/index.js') },
  { id: 'repartir', emoji: '🍕', minutes: 5, load: () => import('./repartir/index.js') },
  { id: 'division', emoji: '➗', minutes: 6, load: () => import('./division/index.js') },
  { id: 'problemas', emoji: '🧠', minutes: 6, load: () => import('./problemas/index.js') },
  { id: 'vocabulario', emoji: '📐', minutes: 8, load: () => import('./vocabulario/index.js') },
  { id: 'simetria', emoji: '🦋', minutes: 7, load: () => import('./simetria/index.js') },
];
