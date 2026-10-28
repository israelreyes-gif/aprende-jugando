import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';

/** Tarjeta grande del curso actual, con la mochila. */
export function currentCourseCard(profile, course) {
  return h(
    'a',
    { class: 'course-card course-card--current', href: paths.course(profile.id, course.id), 'aria-label': course.title },
    h('span', { class: 'course-card__n' }, course.label),
    h(
      'span',
      { class: 'course-card__text' },
      h('span', { class: 'course-card__title' }, course.title.replace(`${course.label} de `, '')),
      h('span', { class: 'course-card__status' }, 'Curso actual'),
      h('span', { class: 'course-card__go' }, '¡Entrar!'),
    ),
    h('span', { class: 'course-card__bag', 'aria-hidden': 'true' }, h('img', { src: 'icons/mochila.svg', alt: '', width: 88, height: 88 })),
  );
}
