import { pick } from '../../../../../core/random.js';
import { ages } from '../../lib/vocab/ages.js';
import { subjects, capital } from '../../was-were/lib/subjects.js';
import { KINDS, mainForm } from './could-forms.js';
import { randomActivity } from './pick-activity.js';

/** Words of "I could swim when I was four." (or its negative / question). */
export function buildTokens(kind, subject, activity, age, verb = mainForm(kind)) {
  const when = ['when', subject.w, subject.be, `${age}${kind === 'q' ? '?' : '.'}`];
  const act = activity.en.split(' ');
  if (kind === 'q') return [verb, subject.w, ...act, ...when];
  return [capital(subject.w), verb, ...act, ...when];
}

/** A random sentence: { kind, subject, activity, age, tokens, text, verbIndex, subjectIndex }. */
// "It" is left out: "It could dress up" makes no sense.
const people = subjects.filter((x) => x.w !== 'it');

export function makeSentence({ kind = pick(KINDS), subject = pick(people) } = {}) {
  const activity = randomActivity();
  const age = pick(ages);
  const tokens = buildTokens(kind, subject, activity, age);
  return {
    kind,
    subject,
    activity,
    age,
    tokens,
    text: tokens.join(' '),
    verbIndex: kind === 'q' ? 0 : 1,
    subjectIndex: kind === 'q' ? 1 : 0,
  };
}

/** The sentence with the word at `index` replaced by "___". */
export function withGap(tokens, index) {
  return tokens.map((t, i) => (i === index ? '___' : t)).join(' ');
}
