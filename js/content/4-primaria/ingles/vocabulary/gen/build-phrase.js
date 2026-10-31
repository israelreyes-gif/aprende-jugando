import { pick, shuffle } from '../../../../../core/random.js';
import { wordsQ } from '../../../../../exercises/make/words.js';
import { activities } from '../../lib/vocab/activities.js';

const EXTRA = ['make', 'do', 'eat', 'read'];

/** Spanish → build the English phrase (only multi-word phrases) with word chips. */
export function buildPhrase() {
  const a = pick(activities.filter((x) => x.en.includes(' ')));
  const answer = a.en.split(' ');
  const extra = shuffle(EXTRA.filter((w) => !answer.includes(w))).slice(0, 2);
  return wordsQ(`Build it in English: ${a.es}`, answer, extra, `${a.es} = ${a.en}`);
}
