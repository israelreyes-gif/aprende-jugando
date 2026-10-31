import { choiceQ } from '../../../../../exercises/make/choice.js';
import { makeSentence, withGap } from '../lib/sentence.js';
import { LABEL, mainForm, wrongForm } from '../lib/could-forms.js';

/** "I ___ swim when I was four. (negative)" → choose the right form. */
export function chooseCould() {
  const s = makeSentence();
  return choiceQ(
    `Choose the correct form.  ${withGap(s.tokens, s.verbIndex)}  ${LABEL[s.kind]}`,
    mainForm(s.kind),
    [wrongForm(s.kind)],
    s.text,
  );
}
