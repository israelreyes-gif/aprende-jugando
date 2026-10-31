import { textQ } from '../../../../../exercises/make/text.js';
import { randomWord, englishFor } from '../lib/pick-words.js';

/** Spanish → write the English word (any English word with that meaning is accepted). */
export function writeWord() {
  const w = randomWord();
  return textQ(`Write it in English: ${w.es}`, englishFor(w), `${w.es} = ${w.en}`);
}
