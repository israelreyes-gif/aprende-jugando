import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { COURSES, SUBJECTS } from '../../content/registry.js';
import { getProfile } from '../../data/profiles.repo.js';
import { listSessions } from '../../data/practice.repo.js';
import { appHeader } from '../../shared/app-header.js';
import { icon } from '../../shared/icons.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { loadStreak } from '../reto/load-streak.js';
import { deleteProfileButton } from './child-stats/delete-profile-button.js';
import { reinforceCards } from './child-stats/reinforce-cards.js';
import { subjectRows } from './child-stats/subject-rows.js';
import { summaryChips } from './child-stats/summary-chips.js';
import { loadCourseProgress } from './child-stats/load-course-progress.js';
import { progressRows } from './child-stats/progress-rows.js';
import { loadTopicTitles } from './child-stats/topic-titles.js';
import { withParentsGate } from './pin-gate.js';
import { computeStats } from './stats.logic.js';

async function renderChildStats({ pid }) {
  const [profile, sessions, streak] = await Promise.all([getProfile(pid), listSessions(pid), loadStreak(pid)]);
  if (!profile) return notFoundView();

  const stats = computeStats(sessions, SUBJECTS.map((s) => s.id), streak);
  const topicTitles = await loadTopicTitles(stats.reinforce);

  const course = COURSES.find((c) => c.available);
  const progress = course ? await loadCourseProgress(pid, course.id) : [];
  const progressSection = course
    ? h('section', { class: 'stack' }, h('h2', { class: 'title-lg' }, 'Progreso del curso'), ...progressRows(profile, course, progress))
    : null;
  const releaseLink = course
    ? h('a', { class: 'btn btn--outline btn--block', href: paths.release(pid, course.id) }, icon('lock', 22), 'Liberar temas')
    : null;

  const body = stats.hasData
    ? [
        summaryChips(stats.summary),
        h('section', { class: 'stack' }, h('h2', { class: 'title-lg' }, 'Por asignatura'), ...subjectRows(stats.bySubject)),
        h('section', { class: 'stack' }, h('h2', { class: 'title-lg' }, 'Necesitan refuerzo'), reinforceCards(stats.reinforce, topicTitles)),
      ]
    : [h('p', { class: 'note note--empty' }, `${profile.name} aún no tiene actividad. Cuando haga ejercicios, las estadísticas aparecerán aquí.`)];

  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: profile.name, sub: 'Estadísticas', back: paths.parents(), profile }),
    h('div', { class: 'screen__body' }, releaseLink, progressSection, ...body, h('div', { class: 'spacer' }), deleteProfileButton(profile)),
  );
}

export function childStatsScreen(params) {
  return withParentsGate(() => renderChildStats(params));
}
