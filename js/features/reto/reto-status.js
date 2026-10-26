import { getReto } from '../../data/reto/get-reto.js';
import { listRetoDays } from '../../data/reto/list-reto-days.js';
import { computeStreak } from './streak/compute-streak.js';
import { spainDay } from './streak/date-keys.js';

/** Cómo va el reto de hoy y la racha de un perfil: { today, reto (o null), streak }. */
export async function loadRetoStatus(profileId) {
  const today = spainDay();
  const [reto, days] = await Promise.all([getReto(profileId, today), listRetoDays(profileId)]);
  return { today, reto, streak: computeStreak(days, today) };
}
