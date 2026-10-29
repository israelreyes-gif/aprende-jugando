import { pick, rnd } from '../../../../../core/random.js';
import { wordsQ } from '../../../../../exercises/make/words.js';
import { timeWords, digital } from '../../lib/time-words.js';

const ROUTINES = [
  ['I have breakfast', 7, 11],
  ['I have lunch', 12, 14],
  ['I have a snack', 4, 6],
  ['I have dinner', 7, 9],
  ['I wake up', 6, 8],
  ['I go to bed', 8, 10],
];

/** Daily routine sentence: "I have breakfast at half past seven." */
export function routine() {
  const [text, from, to] = pick(ROUTINES);
  const h = rnd(from, to);
  const m = pick([0, 15, 30, 45]);
  const words = timeWords(h, m);
  const answer = [...text.split(' '), 'at', ...words.split(' ')];
  const extra = ['in', 'on'];
  return wordsQ(`Build the sentence: ${text} at ${digital(h, m)}`, answer, extra, `${text} at ${words}.`);
}
