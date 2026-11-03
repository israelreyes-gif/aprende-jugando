import { wordsQ } from '../../../../../exercises/make/words.js';
import { makeSentence } from '../lib/sentence.js';
import { LABEL, wrongForm } from '../lib/could-forms.js';

/** Build the sentence with word chips (one extra chip with the wrong verb). */
export function buildSentence() {
  const s = makeSentence();
  return wordsQ(`Build the sentence  ${LABEL[s.kind]}`, s.tokens, [wrongForm(s.kind)], s.text);
}
