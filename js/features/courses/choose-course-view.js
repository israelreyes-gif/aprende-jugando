import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { reload } from '../../core/router.js';
import { setProfileCourse } from '../../data/profiles.repo.js';
import { appHeader } from '../../shared/app-header.js';
import { courseField } from '../profiles/course-field.js';

/** Pantalla para los perfiles que aún no tienen curso: eligen uno y se guarda. */
export function chooseCourseView(profile) {
  let courseId = null;
  const error = h('p', { class: 'field__error', role: 'alert' });
  const save = h('button', { class: 'btn btn--primary btn--block', type: 'submit' }, 'Guardar curso');

  async function onSubmit(event) {
    event.preventDefault();
    error.textContent = '';
    if (!courseId) {
      error.textContent = 'Elige el curso del perfil.';
      return;
    }
    save.disabled = true;
    try {
      await setProfileCourse(profile.id, courseId);
      await reload();
    } catch (err) {
      console.error(err);
      error.textContent = 'No se ha podido guardar el curso. Inténtalo de nuevo.';
      save.disabled = false;
    }
  }

  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: `Hola, ${profile.name}`, sub: 'Elige tu curso', back: paths.home(), profile }),
    h('div', { class: 'screen__body' }, h('form', { class: 'stack', style: { '--gap': '24px' }, onSubmit }, courseField({ onChange: (id) => (courseId = id) }), error, save)),
  );
}
