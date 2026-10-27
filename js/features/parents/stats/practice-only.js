/** Solo las sesiones de ejercicios de un tema; deja fuera las preguntas sueltas del reto diario. */
export const practiceOnly = (sessions) => sessions.filter((s) => s.kind !== 'reto');
