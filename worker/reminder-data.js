/** Móviles con los avisos del reto activados, con el nombre de su perfil. */
export async function listChildDevices(db) {
  const sql = "SELECT d.*, p.name FROM push_devices d JOIN profiles p ON p.id = d.profile_id WHERE d.kind = 'child'";
  return (await db.prepare(sql).all()).results;
}

/**
 * Cursos en los que el perfil puede hacer el reto: con algún tema liberado Y estudiado
 * (igual que js/features/reto/load-reto-topics.js). Sin ellos no hay reto que recordar.
 */
export async function retoCourses(db, profileId) {
  const sql = `SELECT DISTINCT r.course_id FROM topic_release r
    JOIN study_progress s ON s.profile_id = r.profile_id AND s.course_id = r.course_id AND s.subject_id = r.subject_id AND s.topic_id = r.topic_id
    WHERE r.profile_id = ? ORDER BY r.course_id`;
  const rows = (await db.prepare(sql).bind(profileId).all()).results;
  return rows.map((row) => row.course_id);
}

/** Días libres ('AAAA-MM-DD') del perfil: días en que el reto no se exige. */
export async function freeDaysOf(db, profileId) {
  // Si la tabla aún no se ha creado en D1 se trata como "sin días libres" (así el Worker nuevo no rompe nada antes de crearla).
  const rows = (await db.prepare('SELECT day FROM free_days WHERE profile_id = ?').bind(profileId).all().catch(() => ({ results: [] }))).results;
  return rows.map((row) => row.day);
}

/** Días ('AAAA-MM-DD') en los que el perfil terminó el reto. */
export async function finishedRetoDays(db, profileId) {
  const rows = (await db.prepare('SELECT day FROM reto_diario WHERE profile_id = ? AND finished_at IS NOT NULL').bind(profileId).all()).results;
  return rows.map((row) => row.day);
}
