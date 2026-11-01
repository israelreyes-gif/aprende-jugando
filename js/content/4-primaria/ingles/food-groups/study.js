import { groups } from './words.js';

export const study = [
  { h: 'Food groups' },
  { p: 'Cinco grupos de alimentos. Cada uno tiene ejemplos.' },
  ...groups.map((g) => ({ fold: `${g.name} (${g.es})`, list: g.foods })),
];
