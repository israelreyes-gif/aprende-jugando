import { pick, shuffle } from '../../../../../core/random.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';
import { allTimes, timeWords } from '../../lib/time-words.js';
import { clockSvg } from '../../lib/clock-svg.js';

/** Clock drawing → choose the right English phrase. */
export function clockToWords() {
  const t = pick(allTimes());
  const right = timeWords(t.h, t.m);
  const others = shuffle(allTimes().filter((o) => timeWords(o.h, o.m) !== right));
  // Tricky distractors: same hour, mirrored minutes (past ↔ to), then random ones.
  const mirror = timeWords(t.h, (60 - t.m) % 60);
  const wrongs = [...new Set([mirror, ...others.map((o) => timeWords(o.h, o.m))])]
    .filter((w) => w !== right).slice(0, 3);
  return choiceQ('What time is it?', right, wrongs, `${t.h}:${String(t.m).padStart(2, '0')} → ${right}.`, {
    visual: clockSvg(t.h, t.m),
  });
}
