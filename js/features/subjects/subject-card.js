import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { icon } from '../../shared/icons.js';

/** Tarjeta de una asignatura dentro de un curso. */
export function subjectCard(profile, course, subject) {
  return h(
    'a',
    { class: 'card row-card', href: paths.subject(profile.id, course.id, subject.id), style: { '--tint': subject.tint, '--deep': subject.deep }, 'aria-label': subject.name },
    h('span', { class: 'tile' }, icon(subject.id, 30)),
    h(
      'span',
      { class: 'row-card__text' },
      h('span', { class: 'row-card__title' }, subject.name),
      h('span', { class: 'chip' }, subject.lang === 'en' ? 'Content in English' : 'Contenido en español'),
    ),
    h('span', { class: 'row-card__chev' }, icon('chevron')),
  );
}
