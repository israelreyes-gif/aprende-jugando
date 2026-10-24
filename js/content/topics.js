// Carga de temas. El contenido NO vive en la base de datos: son archivos de la app,
// así se versionan en GitHub y funcionan sin conexión.
//
//   content/<curso>/<asignatura>/index.js   -> lista de temas de la asignatura
//   content/<curso>/<asignatura>/<tema>.js  -> lección (study) y ejercicios (exercises)

/** Lista de temas de una asignatura. Un tema con `load` tiene contenido; sin él, es "próximamente". */
export async function loadTopics(courseId, subjectId) {
  try {
    const module = await import(`./${courseId}/${subjectId}/index.js`);
    return module.topics.map((topic) => ({ ...topic, available: typeof topic.load === 'function' }));
  } catch {
    return [];
  }
}

/** Devuelve { topic, study, exercises } o null si el tema no existe o no tiene contenido. */
export async function loadTopic(courseId, subjectId, topicId) {
  const topics = await loadTopics(courseId, subjectId);
  const topic = topics.find((t) => t.id === topicId);
  if (!topic || !topic.available) return null;
  const content = await topic.load();
  return { topic, study: content.study || [], exercises: content.exercises || [] };
}
