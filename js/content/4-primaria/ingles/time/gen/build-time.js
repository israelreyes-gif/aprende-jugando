import { pick } from '../../../../../core/random.js';
import { wordsQ } from '../../../../../exercises/make/words.js';
import { allTimes, timeWords, digital } from '../../lib/time-words.js';

const EXTRA = ['at', 'quarter', 'half', 'to', 'past', "o'clock"];

/** Digital time → build "It's …" with word chips. */
export function buildTime() {
  const t = pick(allTimes());
  const words = timeWords(t.h, t.m);
  const answer = ["It's", ...words.split(' ')];
  const extra = EXTRA.filter((w) => !answer.includes(w)).slice(0, 2);
  return wordsQ(`Build the sentence for ${digital(t.h, t.m)}`, answer, extra, `It's ${words}.`);
}
