import { choiceQ } from '../../../../../exercises/make/choice.js';
import { randomWord, otherWords } from '../lib/pick-words.js';

/** English word → choose the Spanish translation. */
export function enToEs() {
  const w = randomWord();
  return choiceQ(`What does "${w.en}" mean?`, w.es, otherWords(w, 3).map((o) => o.es), `${w.en} = ${w.es}`);
}
