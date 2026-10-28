/** Móviles con los avisos del reto activados, con el nombre de su perfil. */
export async function listChildDevices(db) {
  const sql = "SELECT d.*, p.name FROM push_devices d JOIN profiles p ON p.id = d.profile_id WHERE d.kind = 'child'";
  return (await db.prepare(sql).all()).results;
}

/** Cursos con algún tema liberado para el perfil (sin temas liberados no hay reto que hacer). */
export async function releasedCourses(db, profileId) {
  const rows = (await db.prepare('SELECT DISTINCT course_id FROM topic_release WHERE profile_id = ? ORDER BY course_id').bind(profileId).all()).results;
  return rows.map((row) => row.course_id);
}

/** Días ('AAAA-MM-DD') en los que el perfil terminó el reto. */
export async function finishedRetoDays(db, profileId) {
  const rows = (await db.prepare('SELECT day FROM reto_diario WHERE profile_id = ? AND finished_at IS NOT NULL').bind(profileId).all()).results;
  return rows.map((row) => row.day);
}
