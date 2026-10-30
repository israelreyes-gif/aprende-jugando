import { textQ } from '../../../../../exercises/make/text.js';
import { randomFrame } from '../lib/pick-frame.js';
import { twinOf } from '../lib/wh-words.js';

/** Write the missing question word (What and Which are both accepted when they could fit). */
export function writeWh() {
  const f = randomFrame();
  const answers = [f.wh, twinOf(f.wh)].filter(Boolean);
  return textQ(`Write the question word.  ${f.q.replace(f.wh, '___')}  ${f.a}`, answers, `${f.q}  ${f.a}`);
}
