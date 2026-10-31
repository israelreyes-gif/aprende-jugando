// English topics · 4th grade
// Each topic is a folder with index.js, study.js and exercises.js.
// A topic without `load` appears as "Soon". Topics with the same `unit` are shown together.
const UNIT_1 = 'Unit 1 · Practice Time';

export const topics = [
  { id: 'time', emoji: '⏰', unit: UNIT_1, title: 'Telling the time', minutes: 5, load: () => import('./time/index.js') },
  { id: 'question-words', emoji: '❓', unit: UNIT_1, title: 'Wh- questions', minutes: 5, load: () => import('./question-words/index.js') },
  { id: 'activity-verbs', emoji: '🤸', unit: UNIT_1, title: 'Activity verbs', minutes: 5, load: () => import('./activity-verbs/index.js') },
  { id: 'was-were', emoji: '🕰️', unit: UNIT_1, title: 'Was / were', minutes: 5, load: () => import('./was-were/index.js') },
  { id: 'could', emoji: '💪', unit: UNIT_1, title: "Could / couldn't", minutes: 5, load: () => import('./could/index.js') },
  { id: 'reading-diversicus', emoji: '🎪', unit: UNIT_1, title: 'Reading: Diversicus', minutes: 5 },
];
