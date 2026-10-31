import { textQ } from '../../../../../exercises/make/text.js';
import { makeSentence, withGap } from '../lib/sentence.js';
import { LABEL, beFor } from '../lib/be-forms.js';

/** Write the missing verb form. */
export function writeBe() {
  const s = makeSentence();
  const right = beFor(s.kind, s.subject.be);
  const answers = s.kind === 'neg' ? [right, `${s.subject.be} not`] : [right];
  return textQ(`Write the missing word.  ${withGap(s.tokens, s.verbIndex)}  ${LABEL[s.kind]}`, answers, s.text);
}
