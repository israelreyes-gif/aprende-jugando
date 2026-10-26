import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { icon } from '../../shared/icons.js';
import { notify } from '../../shared/modal.js';

/** Tarjeta de un curso: abierta (enlace) o bloqueada (aviso). */
export function courseCard(profile, course) {
  if (course.available) {
    return h(
      'a',
      { class: 'card course-card', href: paths.course(profile.id, course.id), 'aria-label': course.title },
      h('span', { class: 'course-card__label' }, course.label),
      h('span', { class: 'course-card__status' }, 'Curso actual'),
    );
  }
  return h(
    'button',
    {
      class: 'card course-card course-card--locked', type: 'button', 'aria-disabled': 'true', 'aria-label': `${course.title}, bloqueado`,
      onClick: () => notify({ title: 'Próximamente', message: `El ${course.label} se abrirá más adelante.` }),
    },
    h('span', { class: 'course-card__label' }, course.label),
    h('span', { class: 'course-card__status' }, icon('lock', 18), 'Próximamente'),
  );
}
