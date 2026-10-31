import { pick, shuffle } from '../../../../../core/random.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';

// Phrases from the book with their verb removed.
const PHRASES = [
  { gap: '___ a bike', verb: 'ride', es: 'montar en bici' },
  { gap: '___ a skateboard', verb: 'ride', es: 'montar en monopatín' },
  { gap: '___ the guitar', verb: 'play', es: 'tocar la guitarra' },
  { gap: '___ trees', verb: 'climb', es: 'escalar árboles' },
];
const VERBS = ['ride', 'play', 'swim', 'cook', 'sing', 'jump', 'shout', 'laugh', 'dance', 'catch', 'hop'];

/** Which verb is missing in the phrase? */
export function missingVerb() {
  const p = pick(PHRASES);
  const wrongs = shuffle(VERBS.filter((v) => v !== p.verb)).slice(0, 3);
  return choiceQ(`Which verb is missing?  ${p.gap}  (${p.es})`, p.verb, wrongs, `${p.verb} ${p.gap.replace('___ ', '')} = ${p.es}`);
}
