import { choiceQ } from '../../../../../exercises/make/choice.js';
import { randomFrame, otherWh } from '../lib/pick-frame.js';

/** "___ is your book? It is in the bag." → choose the question word. */
export function chooseWh() {
  const f = randomFrame();
  const gap = f.q.replace(f.wh, '___');
  return choiceQ(`${gap}  ${f.a}`, f.wh, otherWh(f.wh, 3), `${f.q}  ${f.a}`);
}
