import { wordsQ } from '../../../../../exercises/make/words.js';
import { makeSentence, buildTokens } from '../lib/sentence.js';
import { otherBe } from '../lib/be-forms.js';

/** Build the sentence with word chips (one extra chip with the wrong verb). */
export function buildSentence() {
  const s = makeSentence();
  const wrongVerb = buildTokens(s.kind, s.subject, s.pred, otherBe(s.subject.be))[s.verbIndex];
  return wordsQ('Build the sentence', s.tokens, [wrongVerb], s.text);
}
