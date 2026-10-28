/**
 * Reparte los cursos en: el actual (el último abierto), los superados (los anteriores) y los próximos (los posteriores).
 * Devuelve { current, done, locked }. Sin ningún curso abierto, todos quedan como próximos.
 */
export function courseGroups(courses) {
  const open = courses.filter((c) => c.available);
  const current = open[open.length - 1] || null;
  const index = current ? courses.indexOf(current) : -1;
  return {
    current,
    done: courses.filter((c, i) => i < index),
    locked: courses.filter((c, i) => i > index),
  };
}
