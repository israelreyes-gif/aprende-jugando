import { h } from '../../core/dom.js';
import { COURSES } from '../../content/registry.js';

/** Campo "Curso": una tarjeta por curso abierto. Llama a onChange(id) al elegir. */
export function courseField({ onChange }) {
  const open = COURSES.filter((c) => c.available);
  const buttons = open.map((course) =>
    h('button', {
      class: 'course-opt', type: 'button', 'aria-pressed': 'false',
      onClick: () => {
        buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(open[i].id === course.id)));
        onChange(course.id);
      },
    }, course.title),
  );
  return h('div', { class: 'field' }, h('span', { class: 'field__label' }, 'Curso'), h('div', { class: 'course-row' }, buttons), h('p', { class: 'field__hint' }, 'Es el curso que va a estudiar. Después no se puede cambiar desde la app.'));
}
