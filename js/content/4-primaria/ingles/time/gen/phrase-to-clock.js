import { pick, shuffle } from '../../../../../core/random.js';
import { tapQ } from '../../../../../exercises/make/tap.js';
import { allTimes, timeWords } from '../../lib/time-words.js';
import { clockSvg } from '../../lib/clock-svg.js';

/** English phrase → tap the matching clock. */
export function phraseToClock() {
  const right = pick(allTimes());
  const rightWords = timeWords(right.h, right.m);
  const wrong = [];
  // Same hour, mirrored minutes: the classic past/to mix-up.
  const mirror = { h: right.h, m: (60 - right.m) % 60 };
  if (mirror.m !== right.m) wrong.push(mirror);
  for (const o of shuffle(allTimes())) {
    if (wrong.length === 2) break;
    if (timeWords(o.h, o.m) !== rightWords && !wrong.some((w) => w.h === o.h && w.m === o.m)) wrong.push(o);
  }
  const items = shuffle([{ ...right, correct: true }, ...wrong.map((w) => ({ ...w, correct: false }))])
    .map((t) => ({ visual: clockSvg(t.h, t.m), label: timeWords(t.h, t.m), correct: t.correct }));
  return tapQ(`Tap the clock: "${rightWords}"`, items, `${rightWords} = ${right.h}:${String(right.m).padStart(2, '0')}.`);
}
