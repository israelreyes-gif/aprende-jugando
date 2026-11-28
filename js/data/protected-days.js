import { listFreeDays } from './free-days.repo.js';
import { listShields } from './shields.repo.js';

/** Días libres (['AAAA-MM-DD']) y protectores gastados ([{ day, created_at }]) de un perfil. Si no se puede leer alguno, se toma como vacío. */
export async function listProtections(profileId) {
  const [free, shields] = await Promise.all([listFreeDays(profileId).catch(() => []), listShields(profileId).catch(() => [])]);
  return { free, shields };
}

/** Días que no rompen la racha (libres + protegidos). */
export async function listProtectedDays(profileId) {
  const { free, shields } = await listProtections(profileId);
  return [...free, ...shields.map((s) => s.day)];
}
