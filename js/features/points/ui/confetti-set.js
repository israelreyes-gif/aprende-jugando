import { isHalloween } from '../../../shared/seasons.js';

const NORMAL = ['🎉', '⭐', '✨', '🎊', '⭐', '✨'];
const HALLOWEEN = ['🦇', '🎃', '👻', '🦇', '🎃', '👻'];

/** Los seis emojis que caen en la celebración: murciélagos, calabazas y fantasmas en Halloween. */
export function confettiSet(date = new Date()) {
  return isHalloween(date) ? HALLOWEEN : NORMAL;
}
