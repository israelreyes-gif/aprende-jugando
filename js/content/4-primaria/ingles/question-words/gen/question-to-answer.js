import { choiceQ } from '../../../../../exercises/make/choice.js';
import { randomFrame, otherWh } from '../lib/pick-frame.js';
import { frameFor } from '../frames/index.js';

/** Question → choose the right answer. */
export function questionToAnswer() {
  const f = randomFrame();
  const wrongs = [...new Set(otherWh(f.wh, 6).map((wh) => frameFor(wh).a))].filter((a) => a !== f.a).slice(0, 3);
  return choiceQ(`Choose the answer.  "${f.q}"`, f.a, wrongs, `${f.q}  ${f.a}`);
}
