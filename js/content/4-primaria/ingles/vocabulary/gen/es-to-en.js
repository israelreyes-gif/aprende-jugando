import { choiceQ } from '../../../../../exercises/make/choice.js';
import { randomWord, otherWords } from '../lib/pick-words.js';

/** Spanish word → choose the English one. */
export function esToEn() {
  const w = randomWord();
  return choiceQ(`How do you say "${w.es}" in English?`, w.en, otherWords(w, 3).map((o) => o.en), `${w.es} = ${w.en}`);
}
