import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';

/** Tarjeta de un curso superado. Si el curso sigue abierto, es un enlace; si no, solo se muestra. */
export function doneCourseCard(profile, course) {
  const children = [
    h('span', { class: 'course-card__medal', 'aria-hidden': 'true' }, '🏅'),
    h('span', { class: 'course-card__n' }, course.label),
    h('small', { class: 'course-card__status' }, 'Superado ✅'),
  ];
  const label = `${course.title}, superado`;
  return course.available
    ? h('a', { class: 'course-card course-card--done', href: paths.course(profile.id, course.id), 'aria-label': label }, children)
    : h('div', { class: 'course-card course-card--done', 'aria-label': label }, children);
}
