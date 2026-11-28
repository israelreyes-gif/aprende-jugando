const safe = (promise) => promise.catch(() => ({ results: [] })); // tabla aún sin crear en D1: se trata como vacía
const days = (rows) => rows.results.map((row) => row.day);

/** Días libres y días protegidos de un perfil: { free, shields }. */
export async function loadProtections(db, profileId) {
  const [free, shields] = await Promise.all([
    safe(db.prepare('SELECT day FROM free_days WHERE profile_id = ?').bind(profileId).all()),
    safe(db.prepare('SELECT day FROM streak_shields WHERE profile_id = ?').bind(profileId).all()),
  ]);
  return { free: days(free), shields: days(shields) };
}

/** Días que no rompen la racha (libres + protegidos). */
export async function protectedDaysOf(db, profileId) {
  const { free, shields } = await loadProtections(db, profileId);
  return [...free, ...shields];
}
