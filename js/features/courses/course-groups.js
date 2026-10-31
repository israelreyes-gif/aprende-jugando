/**
 * Reparte los cursos en: el actual (el del perfil), los superados (los anteriores) y los próximos (los posteriores).
 * Devuelve { current, done, locked }. Sin curso actual, todos quedan como próximos.
 */
export function courseGroups(courses, currentId) {
  const current = courses.find((c) => c.id === currentId && c.available) || null;
  const index = current ? courses.indexOf(current) : -1;
  return {
    current,
    done: courses.filter((c, i) => i < index),
    locked: courses.filter((c, i) => i > index),
  };
}
