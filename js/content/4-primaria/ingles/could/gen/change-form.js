import { pick } from '../../../../../core/random.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';
import { makeSentence, buildTokens } from '../lib/sentence.js';

/** Affirmative sentence → choose its negative or its question. */
export function changeForm() {
  const s = makeSentence({ kind: 'pos' });
  const target = pick(['neg', 'q']);
  const other = target === 'neg' ? 'q' : 'neg';
  const text = (kind, verb) => buildTokens(kind, s.subject, s.activity, s.age, verb).join(' ');
  const right = text(target);
  const mistake = target === 'neg' ? text('neg', "didn't could") : text('q', 'Did').replace(/^Did (\S+)/, 'Did $1 could');
  const wrongs = [mistake, text(other), s.text];
  const name = target === 'neg' ? 'negative' : 'question';
  return choiceQ(`Choose the ${name}.  "${s.text}"`, right, wrongs, right);
}
