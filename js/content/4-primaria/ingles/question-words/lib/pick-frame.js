import { pick } from '../../../../../core/random.js';
import { whWords, twinOf } from './wh-words.js';
import { frameFor } from '../frames/index.js';

/** A random question + answer: { wh, q, a }. */
export function randomFrame() {
  return frameFor(pick(whWords).wh);
}

/** Other question words (never the twin What/Which), shuffled by pick order. */
export function otherWh(wh, count) {
  const twin = twinOf(wh);
  const pool = whWords.map((w) => w.wh).filter((w) => w !== wh && w !== twin);
  const out = [];
  while (out.length < count && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}
