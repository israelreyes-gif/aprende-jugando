import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { COURSES } from '../../content/registry.js';
import { getProfile } from '../../data/profiles.repo.js';
import { appHeader } from '../../shared/app-header.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { courseCard } from './course-card.js';

/** Cursos de primaria. Solo está abierto el actual; el resto aparece bloqueado. */
export async function coursesScreen({ pid }) {
  const profile = await getProfile(pid);
  if (!profile) return notFoundView();

  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: `Hola, ${profile.name}`, sub: 'Elige tu curso', back: paths.home(), profile }),
    h('div', { class: 'screen__body' }, h('div', { class: 'grid-2' }, COURSES.map((course) => courseCard(profile, course)))),
  );
}
