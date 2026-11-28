import { listProtectedDays } from '../../data/protected-days.js';
import { listRetoDays } from '../../data/reto/list-reto-days.js';
import { computeStreak } from './streak/compute-streak.js';
import { spainDay } from './streak/date-keys.js';

/** Racha actual de un perfil (0 si no se puede consultar). */
export async function loadStreak(profileId) {
  try {
    const [days, freeDays] = await Promise.all([listRetoDays(profileId), listProtectedDays(profileId)]);
    return computeStreak(days, spainDay(), freeDays);
  } catch {
    return 0;
  }
}
