import { pick, shuffle } from '../../../../../core/random.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';
import { allTimes, timeWords, digital } from '../../lib/time-words.js';

/** Digital time → choose the words. */
export function digitalToWords() {
  const t = pick(allTimes());
  const right = timeWords(t.h, t.m);
  const wrongs = [...new Set([
    timeWords(t.h, (60 - t.m) % 60),
    ...shuffle(allTimes()).map((o) => timeWords(o.h, o.m)),
  ])].filter((w) => w !== right).slice(0, 3);
  return choiceQ(`How do we say ${digital(t.h, t.m)}?`, right, wrongs, `${digital(t.h, t.m)} → ${right}.`);
}
