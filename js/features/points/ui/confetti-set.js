import { isHalloween, isChristmas } from '../../../shared/seasons.js';

const NORMAL = ['🎉', '⭐', '✨', '🎊', '⭐', '✨', '🎈', '🎉', '⭐', '🎊', '✨', '🎈', '🎉', '⭐', '🎊', '✨'];
const CHRISTMAS = ['❄️', '🎅', '⛄', '🎄', '❄️', '⭐', '🎁', '❄️', '🎅', '⛄', '🎄', '❄️', '⭐', '🎁', '❄️', '🎄'];
const HALLOWEEN = ['🦇', '🎃', '👻', '🕷️', '🦇', '🎃', '👻', '🕷️', '🦇', '🎃', '👻', '🕷️', '🦇', '🕷️', '👻', '🎃'];

/** Los emojis que caen en la celebración: 16 de confeti; en Halloween y Navidad 16 de cada temporada. */
export function confettiSet(date = new Date()) {
  if (isHalloween(date)) return HALLOWEEN;
  if (isChristmas(date)) return CHRISTMAS;
  return NORMAL;
}
