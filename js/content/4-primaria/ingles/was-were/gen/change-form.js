import { pick } from '../../../../../core/random.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';
import { makeSentence, buildTokens } from '../lib/sentence.js';
import { otherBe } from '../lib/be-forms.js';

/** Affirmative sentence → choose its negative or its question. */
export function changeForm() {
  const s = makeSentence({ kind: 'pos' });
  const target = pick(['neg', 'q']);
  const other = target === 'neg' ? 'q' : 'neg';
  const text = (kind, be) => buildTokens(kind, s.subject, s.pred, be).join(' ');
  const be = s.subject.be;
  const right = text(target, be);
  const wrongs = [text(target, otherBe(be)), text(other, be), s.text];
  const name = target === 'neg' ? 'negative' : 'question';
  return choiceQ(`Choose the ${name}.  "${s.text}"`, right, wrongs, right);
}
