import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { SUBJECTS, getCourse } from '../../content/registry.js';
import { getProfile } from '../../data/profiles.repo.js';
import { appHeader } from '../../shared/app-header.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { retoCard } from '../reto/reto-card.js';
import { loadRetoStatus } from '../reto/reto-status.js';
import { subjectCard } from './subject-card.js';

/** Asignaturas de un curso, con el reto de hoy arriba. */
export async function courseScreen({ pid, cid }) {
  const course = getCourse(cid);
  const [profile, status] = await Promise.all([getProfile(pid), loadRetoStatus(pid).catch(() => null)]);
  if (!profile || !course || !course.available) return notFoundView();

  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: course.title, sub: profile.name, back: paths.courses(pid), profile }),
    h(
      'div',
      { class: 'screen__body' },
      retoCard({ profile, course, status }),
      h('p', { class: 'lead' }, 'Toca una asignatura para empezar.'),
      h('div', { class: 'stack' }, SUBJECTS.map((subject) => subjectCard(profile, course, subject))),
    ),
  );
}
