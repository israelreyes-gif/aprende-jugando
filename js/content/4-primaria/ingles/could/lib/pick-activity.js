import { pick, shuffle } from '../../../../../core/random.js';
import { activities } from '../../lib/vocab/activities.js';

// "catch" needs an object ("catch a ball"), so it does not fit "I could ___ when I was four".
const pool = activities.filter((a) => a.en !== 'catch');

/** A random activity that works after "could". */
export function randomActivity() {
  return pick(pool);
}

/** `count` other activities from different groups (never look-alikes of `item`). */
export function otherActivities(item, count) {
  const seen = new Set([item.group]);
  const out = [];
  for (const a of shuffle(pool)) {
    if (out.length === count) break;
    if (seen.has(a.group)) continue;
    seen.add(a.group);
    out.push(a);
  }
  return out;
}
