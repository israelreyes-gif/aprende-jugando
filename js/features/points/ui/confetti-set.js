import { isHalloween } from '../../../shared/seasons.js';

const NORMAL = ['🎉', '⭐', '✨', '🎊', '⭐', '✨', '🎈', '🎉', '⭐', '🎊', '✨', '🎈', '🎉', '⭐', '🎊', '✨'];
const HALLOWEEN = ['🦇', '🎃', '👻', '🕷️', '🦇', '🎃', '👻', '🕷️', '🦇', '🎃', '👻', '🕷️', '🦇', '🕷️', '👻', '🎃'];

/** Los emojis que caen en la celebración: 16 de confeti; en Halloween 16 (murciélagos, calabazas, fantasmas y arañas). */
export function confettiSet(date = new Date()) {
  return isHalloween(date) ? HALLOWEEN : NORMAL;
}
