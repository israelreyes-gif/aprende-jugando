import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { COURSES } from '../../content/registry.js';
import { getProfile } from '../../data/profiles.repo.js';
import { appHeader } from '../../shared/app-header.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { loadPointsOrNull } from '../points/load-points.js';
import { levelCard } from '../points/ui/level-card.js';
import { courseGroups } from './course-groups.js';
import { currentCourseCard } from './current-course-card.js';
import { doneCourseCard } from './done-course-card.js';
import { loadCoursePercentOrNull } from './load-course-percent.js';
import { lockedCourseCard } from './locked-course-card.js';

const CHEER = '¡Mira todo lo que has conseguido! Cada curso superado demuestra que puedes con todo. ¡Sigue así! 🌟';

/** Cursos de primaria: el actual en grande, los superados con un mensaje de ánimo y los próximos bloqueados. */
export async function coursesScreen({ pid }) {
  const [profile, points, percent] = await Promise.all([getProfile(pid), loadPointsOrNull(pid), loadCoursePercentOrNull(pid)]);
  if (!profile) return notFoundView();

  const { current, done, locked } = courseGroups(COURSES);

  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: `Hola, ${profile.name}`, sub: 'Elige tu curso', back: paths.home(), profile }),
    h(
      'div',
      { class: 'screen__body' },
      points ? levelCard({ points, profileId: pid, gender: profile.gender, course: percent }) : null,
      current ? currentCourseCard(profile, current) : null,
      done.length
        ? h('section', { class: 'stack' }, h('h2', { class: 'section-label section-label--done' }, 'Cursos superados'), h('div', { class: 'course-grid' }, done.map((c) => doneCourseCard(profile, c))), h('p', { class: 'cheer' }, CHEER))
        : null,
      locked.length ? h('section', { class: 'stack' }, h('h2', { class: 'section-label' }, 'Próximos cursos'), h('div', { class: 'course-grid' }, locked.map(lockedCourseCard))) : null,
    ),
  );
}
