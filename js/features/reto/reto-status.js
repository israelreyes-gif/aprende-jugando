import { getReto } from '../../data/reto/get-reto.js';
import { listRetoDays } from '../../data/reto/list-reto-days.js';
import { listProtections } from '../../data/protected-days.js';
import { computeStreak } from './streak/compute-streak.js';
import { spainDay } from './streak/date-keys.js';
import { diamondProgress } from './diamonds/diamond-progress.js';
import { MAX_SHIELDS, SHIELD_EVERY, shieldBalance } from './diamonds/shield-balance.js';
import { streakAlert } from './diamonds/streak-alert.js';

/**
 * Cómo va el reto de hoy y la racha de un perfil:
 * { today, reto (o null), streak, diamonds: { available, max, nextAt, ratio },
 *   alert: lo que hay que contarle sobre su racha (streakAlert) o null,
 *   earned: 'earned' | 'earned-max' si el reto de hoy ha completado un múltiplo de 30 días (o null) }.
 */
export async function loadRetoStatus(profileId) {
  const today = spainDay();
  const [reto, days, { free, shields }] = await Promise.all([getReto(profileId, today), listRetoDays(profileId), listProtections(profileId)]);
  const protectedDays = [...free, ...shields.map((s) => s.day)];
  const streak = computeStreak(days, today, protectedDays);
  const { available } = shieldBalance(days, free, shields);
  const doneToday = days.includes(today);

  let earned = null;
  if (doneToday && streak > 0 && streak % SHIELD_EVERY === 0) {
    const before = shieldBalance(days.filter((d) => d !== today), free, shields).available;
    earned = before >= MAX_SHIELDS ? 'earned-max' : 'earned';
  }
  return {
    today,
    reto,
    streak,
    diamonds: { available, max: MAX_SHIELDS, ...diamondProgress(streak) },
    alert: streakAlert({ doneDays: days, protectedDays, available, today }),
    earned,
  };
}
