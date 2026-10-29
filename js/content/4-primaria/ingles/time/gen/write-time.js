import { pick } from '../../../../../core/random.js';
import { textQ } from '../../../../../exercises/make/text.js';
import { allTimes, timeWords } from '../../lib/time-words.js';
import { clockSvg } from '../../lib/clock-svg.js';

/** Clock drawing → write the time (with or without "It's"; hyphen or space). */
export function writeTime() {
  const t = pick(allTimes());
  const words = timeWords(t.h, t.m);
  const bases = [words, words.replace('-', ' ')];
  const answers = [...new Set(bases.flatMap((b) => [b, `It's ${b}`, `It is ${b}`]))];
  return textQ('Write the time in words.', answers, `It's ${words}.`, { visual: clockSvg(t.h, t.m) });
}
