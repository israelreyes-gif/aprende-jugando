import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { subjectsOf, getCourse } from '../../content/registry.js';
import { getProfile } from '../../data/profiles.repo.js';
import { appHeader } from '../../shared/app-header.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { loadPointsOrNull } from '../points/load-points.js';
import { levelCard } from '../points/ui/level-card.js';
import { loadCoursePercentOrNull } from '../courses/load-course-percent.js';
import { retoCard } from '../reto/reto-card.js';
import { loadRetoStatus } from '../reto/reto-status.js';
import { subjectCard } from './subject-card.js';

/** Asignaturas de un curso, con el reto de hoy arriba. */
export async function courseScreen({ pid, cid }) {
  const course = getCourse(cid);
  const [profile, status, points, percent] = await Promise.all([getProfile(pid), loadRetoStatus(pid).catch(() => null), loadPointsOrNull(pid), loadCoursePercentOrNull(pid, cid)]);
  if (!profile || !course || !course.available) return notFoundView();

  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: course.title, sub: profile.name, back: paths.courses(pid), profile }),
    h(
      'div',
      { class: 'screen__body' },
      points ? levelCard({ points, profileId: pid, gender: profile.gender, course: percent }) : null,
      retoCard({ profile, course, status }),
      h('p', { class: 'lead' }, 'Toca una asignatura para empezar.'),
      h('div', { class: 'stack' }, subjectsOf(course).map((subject) => subjectCard(profile, course, subject))),
    ),
  );
}
