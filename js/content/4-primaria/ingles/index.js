// English topics · 4th grade
// Each topic is a folder with index.js, study.js and exercises.js.
// Titles are NOT here: they live in the D1 table `topic_titles`.
// A topic without `load` appears as "Soon". Topics with the same `unit` are shown together.
const UNIT_1 = 'Unit 1 · Practice Time';
const UNIT_2 = "Unit 2 · What's for breakfast?";
export const topics = [
  { id: 'time', emoji: '⏰', unit: UNIT_1, minutes: 5, load: () => import('./time/index.js') },
  { id: 'question-words', emoji: '❓', unit: UNIT_1, minutes: 5, load: () => import('./question-words/index.js') },
  { id: 'vocabulary', emoji: '📖', unit: UNIT_1, minutes: 5, load: () => import('./vocabulary/index.js') },
  { id: 'was-were', emoji: '🕰️', unit: UNIT_1, minutes: 5, load: () => import('./was-were/index.js') },
  { id: 'could', emoji: '💪', unit: UNIT_1, minutes: 5, load: () => import('./could/index.js') },
  { id: 'reading-crow', emoji: '🐦', unit: UNIT_1, minutes: 5, load: () => import('./reading-crow/index.js') },
  { id: 'food-drink', emoji: '🥛', unit: UNIT_2, minutes: 5, load: () => import('./food-drink/index.js') },
  { id: 'who-which-where', emoji: '🧑‍🍳', unit: UNIT_2, minutes: 5, load: () => import('./who-which-where/index.js') },
  { id: 'irregular-verbs', emoji: '✍️', unit: UNIT_2, minutes: 5, load: () => import('./irregular-verbs/index.js') },
  { id: 'past-when', emoji: '🎡', unit: UNIT_2, minutes: 5, load: () => import('./past-when/index.js') },
  { id: 'food-groups', emoji: '🥦', unit: UNIT_2, minutes: 5, load: () => import('./food-groups/index.js') },
  { id: 'reading-hare', emoji: '🐢', unit: UNIT_2, minutes: 5, load: () => import('./reading-hare/index.js') },
];
