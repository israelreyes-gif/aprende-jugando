import { h } from '../../core/dom.js';

/** Tarjeta de un curso superado: solo se muestra. */
export function doneCourseCard(profile, course) {
  return h(
    'div',
    { class: 'course-card course-card--done', 'aria-label': `${course.title}, superado` },
    h('span', { class: 'course-card__medal', 'aria-hidden': 'true' }, '🏅'),
    h('span', { class: 'course-card__n' }, course.label),
    h('small', { class: 'course-card__status' }, 'Superado ✅'),
  );
}
