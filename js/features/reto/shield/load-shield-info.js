import { listRetoDays } from '../../../data/reto/list-reto-days.js';
import { listProtections } from '../../../data/protected-days.js';
import { shieldBalance } from './shield-balance.js';

/** Protectores de un perfil para la zona de padres: { earned, used, available, shieldDays (más reciente primero) }. */
export async function loadShieldInfo(profileId) {
  const [days, { free, shields }] = await Promise.all([listRetoDays(profileId), listProtections(profileId)]);
  return { ...shieldBalance(days, free, shields), shieldDays: [...shields].sort().reverse() };
}
