import { h } from '../../../core/dom.js';
import { reload } from '../../../core/router.js';
import { COURSES, profileCourse } from '../../../content/registry.js';
import { setProfileCourse } from '../../../data/profiles.repo.js';
import { notify } from '../../../shared/modal.js';

/** Elige el curso que estudia el perfil (solo los cursos abiertos). */
export function coursePicker(profile) {
  const current = profileCourse(profile);
  async function choose(course) {
    if (course.id === current.id) return;
    try {
      await setProfileCourse(profile.id, course.id);
      await reload();
    } catch (err) {
      console.error(err);
      notify({ kind: 'error', title: 'No se ha podido cambiar el curso', message: 'Inténtalo de nuevo.' });
    }
  }
  const options = COURSES.filter((c) => c.available).map((course) =>
    h('button', { class: course.id === current.id ? 'btn' : 'btn btn--outline', type: 'button', 'aria-pressed': String(course.id === current.id), onClick: () => choose(course) }, course.title),
  );
  return h('section', { class: 'stack' }, h('h2', { class: 'title-lg' }, 'Curso de ' + profile.name), h('div', { class: 'stack' }, options));
}
