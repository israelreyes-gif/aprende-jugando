import { textQ } from '../../../../../exercises/make/text.js';
import { makeSentence, withGap } from '../lib/sentence.js';
import { LABEL, mainForm } from '../lib/could-forms.js';

/** Write the missing could / couldn't / Could. */
export function writeCould() {
  const s = makeSentence();
  const right = mainForm(s.kind);
  const answers = s.kind === 'neg' ? [right, 'could not'] : [right];
  return textQ(`Write the missing word.  ${withGap(s.tokens, s.verbIndex)}  ${LABEL[s.kind]}`, answers, s.text);
}
