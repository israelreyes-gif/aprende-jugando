import { listFreeDays } from './free-days.repo.js';
import { listShieldDays } from './shields.repo.js';

/** Días libres y días protegidos de un perfil: { free, shields }. Si no se puede leer alguno, se toma como vacío. */
export async function listProtections(profileId) {
  const [free, shields] = await Promise.all([listFreeDays(profileId).catch(() => []), listShieldDays(profileId).catch(() => [])]);
  return { free, shields };
}

/** Días que no rompen la racha (libres + protegidos). */
export async function listProtectedDays(profileId) {
  const { free, shields } = await listProtections(profileId);
  return [...free, ...shields];
}
