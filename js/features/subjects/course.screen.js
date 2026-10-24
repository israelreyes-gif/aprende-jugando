import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { SUBJECTS, getCourse } from '../../content/registry.js';
import { getProfile } from '../../data/profiles.repo.js';
import { appHeader } from '../../shared/app-header.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { subjectCard } from './subject-card.js';

/** Asignaturas de un curso. */
export async function courseScreen({ pid, cid }) {
  const course = getCourse(cid);
  const profile = await getProfile(pid);
  if (!profile || !course || !course.available) return notFoundView();

  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: course.title, sub: profile.name, back: paths.courses(pid), profile }),
    h(
      'div',
      { class: 'screen__body' },
      h('p', { class: 'lead' }, 'Toca una asignatura para empezar.'),
      h('div', { class: 'stack' }, SUBJECTS.map((subject) => subjectCard(profile, course, subject))),
    ),
  );
}
