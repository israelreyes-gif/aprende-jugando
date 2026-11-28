import { getReto } from '../../data/reto/get-reto.js';
import { listRetoDays } from '../../data/reto/list-reto-days.js';
import { listProtections } from '../../data/protected-days.js';
import { computeStreak } from './streak/compute-streak.js';
import { spainDay } from './streak/date-keys.js';
import { missedDays } from './shield/missed-days.js';
import { shieldBalance } from './shield/shield-balance.js';

/**
 * Cómo va el reto de hoy y la racha de un perfil:
 * { today, reto (o null), streak, shields: { available }, missed: días que se podrían proteger }.
 */
export async function loadRetoStatus(profileId) {
  const today = spainDay();
  const [reto, days, { free, shields }] = await Promise.all([getReto(profileId, today), listRetoDays(profileId), listProtections(profileId)]);
  const { available } = shieldBalance(days, free, shields);
  return {
    today,
    reto,
    streak: computeStreak(days, today, [...free, ...shields.map((s) => s.day)]),
    shields: { available },
    missed: available > 0 ? missedDays(days, free, shields.map((s) => s.day), today) : [],
  };
}
