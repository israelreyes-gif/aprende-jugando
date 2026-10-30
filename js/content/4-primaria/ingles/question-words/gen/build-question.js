import { wordsQ } from '../../../../../exercises/make/words.js';
import { randomFrame, otherWh } from '../lib/pick-frame.js';

/** Build the question with word chips; the answer is shown as a clue. */
export function buildQuestion() {
  const f = randomFrame();
  const answer = f.q.split(' ');
  const extra = otherWh(f.wh, 2).filter((w) => !answer.includes(w));
  return wordsQ(`Build the question.  Answer: "${f.a}"`, answer, extra, f.q);
}
