import { pick, shuffle } from '../../../../../core/random.js';
import { activities } from '../../lib/vocab/activities.js';

/** A random activity. */
export function randomActivity() {
  return pick(activities);
}

/** `count` other activities from different groups (never look-alikes of `item`). */
export function otherActivities(item, count) {
  const seen = new Set([item.group]);
  const out = [];
  for (const a of shuffle(activities)) {
    if (out.length === count) break;
    if (seen.has(a.group)) continue;
    seen.add(a.group);
    out.push(a);
  }
  return out;
}
