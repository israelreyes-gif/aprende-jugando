// English topics · 1st grade (his mother's course)
// Each topic is a folder with index.js, study.js and exercises.js. Titles live in the D1 table `topic_titles`.
export const topics = [
  { id: 'to-be', emoji: '🧍', minutes: 5, load: () => import('./to-be/index.js') },
  { id: 'to-be-negative', emoji: '🙅', minutes: 5, load: () => import('./to-be-negative/index.js') },
  { id: 'numbers-0-20', emoji: '🔢', minutes: 5, load: () => import('./numbers-0-20/index.js') },
  { id: 'numbers-20-100', emoji: '💯', minutes: 5, load: () => import('./numbers-20-100/index.js') },
  { id: 'countries', emoji: '🌍', minutes: 5, load: () => import('./countries/index.js') },
  { id: 'jobs', emoji: '👩‍⚕️', minutes: 5, load: () => import('./jobs/index.js') },
  { id: 'personal-info', emoji: '🪪', minutes: 5, load: () => import('./personal-info/index.js') },
  { id: 'family', emoji: '👨‍👩‍👧', minutes: 5, load: () => import('./family/index.js') },
  { id: 'possessives', emoji: '🫴', minutes: 5, load: () => import('./possessives/index.js') },
  { id: 'plurals', emoji: '📚', minutes: 5, load: () => import('./plurals/index.js') },
  { id: 'this-that', emoji: '👉', minutes: 5, load: () => import('./this-that/index.js') },
  { id: 'adjectives', emoji: '🧑‍🦰', minutes: 5, load: () => import('./adjectives/index.js') },
  { id: 'have-got', emoji: '🎒', minutes: 5, load: () => import('./have-got/index.js') },
  { id: 'have-got-questions', emoji: '🙋', minutes: 5, load: () => import('./have-got-questions/index.js') },
  { id: 'genitive', emoji: '🏷️', minutes: 5, load: () => import('./genitive/index.js') },
  { id: 'question-words', emoji: '❓', minutes: 5, load: () => import('./question-words/index.js') },
];
