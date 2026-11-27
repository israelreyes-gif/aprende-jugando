/** Solo las sesiones de ejercicios de un tema; deja fuera las preguntas sueltas del reto diario y las del mix. */
export const practiceOnly = (sessions) => sessions.filter((s) => (s.kind ?? 'practice') === 'practice');
