import { choiceQ } from '../../../../../exercises/make/choice.js';
import { makeSentence, withGap } from '../lib/sentence.js';
import { LABEL, beFor, otherBe } from '../lib/be-forms.js';

/** "She ___ at home." → choose was / were (or wasn't / weren't, Was / Were). */
export function chooseBe() {
  const s = makeSentence();
  const right = beFor(s.kind, s.subject.be);
  const wrong = beFor(s.kind, otherBe(s.subject.be));
  return choiceQ(`Choose the correct form.  ${withGap(s.tokens, s.verbIndex)}  ${LABEL[s.kind]}`, right, [wrong], s.text);
}
