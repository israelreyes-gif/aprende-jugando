import { pick } from '../../../../../core/random.js';
import { who } from './who.js';
import { when } from './when.js';
import { what } from './what.js';
import { why } from './why.js';
import { where } from './where.js';
import { which } from './which.js';
import { whose } from './whose.js';
import { how } from './how.js';

const FRAMES = { Who: who, When: when, What: what, Why: why, Where: where, Which: which, Whose: whose, How: how };

/** A new question + answer for the given question word: { wh, q, a }. */
export function frameFor(wh) {
  return pick(FRAMES[wh])();
}
