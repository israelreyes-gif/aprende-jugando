import { pick, shuffle } from '../../../../../core/random.js';
import { sections } from '../sections.js';

/** A random word: first a random section, so the long Verbs list does not swallow the short ones. */
export function randomWord() {
  const section = pick(sections);
  return { ...pick(section.words), section };
}

/** `count` other words from the same section; never a look-alike (same group) or one with the same meaning. */
export function otherWords(item, count) {
  const out = [];
  const seenEs = new Set([item.es]);
  const seenGroups = new Set(item.group ? [item.group] : []);
  for (const w of shuffle(item.section.words)) {
    if (out.length === count) break;
    if (w.en === item.en || seenEs.has(w.es) || (w.group && seenGroups.has(w.group))) continue;
    seenEs.add(w.es);
    if (w.group) seenGroups.add(w.group);
    out.push(w);
  }
  return out;
}

/** Every English word with the same Spanish meaning (for example "classroom" and "lesson" are both "clase"). */
export function englishFor(item) {
  return sections.flatMap((s) => s.words).filter((w) => w.es === item.es).map((w) => w.en);
}
