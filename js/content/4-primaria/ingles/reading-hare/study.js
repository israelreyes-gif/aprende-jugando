import { story, moral } from './story.js';
import { words } from './words.js';

// First read the story, then do the exercises.
export const study = [
  { h: 'The Hare and the Tortoise' },
  ...story.map((p) => ({ p })),
  { tip: moral, label: 'Moral' },
  { fold: 'Words from the story', list: words },
];
