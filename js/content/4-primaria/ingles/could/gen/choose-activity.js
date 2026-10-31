import { choiceQ } from '../../../../../exercises/make/choice.js';
import { makeSentence, withGap } from '../lib/sentence.js';
import { otherActivities } from '../lib/pick-activity.js';

/** The activity is missing: the Spanish translation is the clue. */
export function chooseActivity() {
  const s = makeSentence();
  const start = 2; // the activity always starts at the third word
  const count = s.activity.en.split(' ').length;
  const gap = s.tokens.map((t, i) => (i === start ? '___' : t)).filter((_, i) => i < start + 1 || i >= start + count).join(' ');
  const wrongs = otherActivities(s.activity, 3).map((a) => a.en);
  return choiceQ(`Which activity is missing?  ${gap}  (${s.activity.es})`, s.activity.en, wrongs, s.text);
}
