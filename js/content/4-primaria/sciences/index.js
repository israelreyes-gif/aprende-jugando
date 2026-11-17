// Sciences topics · 4th grade
// Each topic is a folder with index.js, study.js and exercises.js.
// Titles are NOT here: they live in the D1 table `topic_titles`.
export const topics = [
  { id: 'cells-tissues-organs', emoji: '🧬', minutes: 5, load: () => import('./cells-tissues-organs/index.js') },
];
