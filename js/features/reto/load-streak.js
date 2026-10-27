import { listRetoDays } from '../../data/reto/list-reto-days.js';
import { computeStreak } from './streak/compute-streak.js';
import { spainDay } from './streak/date-keys.js';

/** Racha actual de un perfil (0 si no se puede consultar). */
export async function loadStreak(profileId) {
  try {
    return computeStreak(await listRetoDays(profileId), spainDay());
  } catch {
    return 0;
  }
}
