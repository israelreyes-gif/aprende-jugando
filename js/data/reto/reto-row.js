const parseList = (text) => {
  try {
    const list = JSON.parse(text);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

/**
 * Convierte una fila de reto_diario en un objeto cómodo:
 * plan: qué preguntas tocan (tema, ejercicio y semilla). answers: lo respondido hasta ahora.
 * finished: true si ya terminó las preguntas del día.
 */
export function parseRetoRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    profileId: row.profile_id,
    courseId: row.course_id,
    day: row.day,
    plan: parseList(row.questions),
    answers: parseList(row.answers),
    finished: Boolean(row.finished_at),
  };
}
