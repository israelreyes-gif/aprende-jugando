import { shuffle } from '../../../../../core/random.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';
import { subjects, capital } from '../lib/subjects.js';
import { makeSentence, withGap } from '../lib/sentence.js';
import { LABEL, otherBe } from '../lib/be-forms.js';

/** "___ were in the garden." → choose the subject that goes with the verb. */
export function chooseSubject() {
  const s = makeSentence();
  const show = (sub) => (s.subjectIndex === 0 ? capital(sub.w) : sub.w);
  const wrongs = shuffle(subjects.filter((x) => x.be === otherBe(s.subject.be))).slice(0, 3).map(show);
  return choiceQ(`Which subject goes here?  ${withGap(s.tokens, s.subjectIndex)}  ${LABEL[s.kind]}`, show(s.subject), wrongs, s.text);
}
