import { choiceQ } from '../../../../../exercises/make/choice.js';
import { randomFrame, otherWh } from '../lib/pick-frame.js';
import { frameFor } from '../frames/index.js';

/** Answer → choose the question that goes with it. */
export function answerToQuestion() {
  const f = randomFrame();
  const wrongs = [...new Set(otherWh(f.wh, 6).map((wh) => frameFor(wh).q))].filter((q) => q !== f.q).slice(0, 3);
  return choiceQ(`Which question goes with this answer?  "${f.a}"`, f.q, wrongs, `${f.q}  ${f.a}`);
}
