import { pick, shuffle } from '../../../../../core/random.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';
import { whWords } from '../lib/wh-words.js';

/** Question word ↔ Spanish translation, in both directions. */
export function translateWh() {
  const w = pick(whWords);
  const others = shuffle(whWords.filter((o) => o.wh !== w.wh)).slice(0, 3);
  const explain = `${w.wh} = ${w.es}`;
  if (Math.random() < 0.5) {
    return choiceQ(`What does "${w.wh}" mean?`, w.es, others.map((o) => o.es), explain);
  }
  return choiceQ(`How do you say ${w.es} in English?`, w.wh, others.map((o) => o.wh), explain);
}
