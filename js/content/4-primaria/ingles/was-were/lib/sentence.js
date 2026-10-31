import { pick } from '../../../../../core/random.js';
import { pastPlaces, pastFeelings } from '../../lib/vocab/past-predicates.js';
import { subjects, capital } from './subjects.js';
import { KINDS, beFor } from './be-forms.js';

/** Words of a sentence: affirmative, negative or question. `be` can be forced ('was' | 'were'). */
export function buildTokens(kind, subject, pred, be = subject.be) {
  const verb = beFor(kind, be);
  const end = kind === 'q' ? '?' : '.';
  const words = pred.split(' ');
  words[words.length - 1] += end;
  if (kind === 'q') return [verb, subject.w, ...words];
  return [capital(subject.w), verb, ...words];
}

/** A random sentence: { kind, subject, pred, tokens, text, verbIndex, subjectIndex }. */
export function makeSentence({ kind = pick(KINDS), subject = pick(subjects), pred } = {}) {
  // "It" only goes with places ("It was in the garden"), not with feelings.
  const options = subject.w === 'it' ? pastPlaces : [...pastPlaces, ...pastFeelings];
  const ending = pred || pick(options);
  const tokens = buildTokens(kind, subject, ending);
  return {
    kind,
    subject,
    pred: ending,
    tokens,
    text: tokens.join(' '),
    verbIndex: kind === 'q' ? 0 : 1,
    subjectIndex: kind === 'q' ? 1 : 0,
  };
}

/** The sentence with one word replaced by "___". */
export function withGap(tokens, index) {
  return tokens.map((t, i) => (i === index ? '___' : t)).join(' ');
}
