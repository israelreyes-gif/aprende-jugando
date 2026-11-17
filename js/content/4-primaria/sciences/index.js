// Sciences topics · 4th grade
// Each topic is a folder with index.js, study.js and exercises.js.
// Titles are NOT here: they live in the D1 table `topic_titles`.
export const topics = [
  { id: 'cells-tissues-organs', emoji: '🧬', minutes: 5, load: () => import('./cells-tissues-organs/index.js') },
  { id: 'blood', emoji: '🩸', minutes: 5, load: () => import('./blood/index.js') },
  { id: 'heart-vessels', emoji: '❤️', minutes: 5, load: () => import('./heart-vessels/index.js') },
  { id: 'digestive', emoji: '🍽️', minutes: 5, load: () => import('./digestive/index.js') },
  { id: 'respiratory', emoji: '🫁', minutes: 5, load: () => import('./respiratory/index.js') },
  { id: 'excretory', emoji: '💧', minutes: 5, load: () => import('./excretory/index.js') },
  { id: 'locomotor', emoji: '🦴', minutes: 5, load: () => import('./locomotor/index.js') },
  { id: 'senses', emoji: '👀', minutes: 5, load: () => import('./senses/index.js') },
  { id: 'reproduction', emoji: '👶', minutes: 5, load: () => import('./reproduction/index.js') },
];
