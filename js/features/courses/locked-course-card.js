import { h } from '../../core/dom.js';
import { notify } from '../../shared/modal.js';

/** Tarjeta de un curso que aún no se puede abrir (aviso al tocarla). */
export function lockedCourseCard(course) {
  return h(
    'button',
    {
      class: 'course-card course-card--locked', type: 'button', 'aria-disabled': 'true', 'aria-label': `${course.title}, bloqueado`,
      onClick: () => notify({ title: 'Próximamente', message: `El ${course.label} se abrirá más adelante.` }),
    },
    h('span', { class: 'course-card__n' }, course.label),
    h('small', { class: 'course-card__status' }, '🔒 Próximamente'),
  );
}
