import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { getCourse, getSubject, loadTopics } from '../../content/registry.js';
import { getProfile } from '../../data/profiles.repo.js';
import { listSessions } from '../../data/practice.repo.js';
import { listReleased } from '../../data/release.repo.js';
import { listStudied } from '../../data/study.repo.js';
import { appHeader } from '../../shared/app-header.js';
import { texts } from '../../shared/i18n.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { buildProgress } from './subject-progress.js';
import { topicCard } from './topic-card.js';
import { topicsSummary } from './topics-summary.js';

/** Una asignatura: pestañas Estudio / Ejercicios con las tarjetas de temas. */
export async function subjectScreen({ pid, cid, sid, tab }) {
  const activeTab = tab === 'practice' ? 'practice' : 'study';
  const course = getCourse(cid);
  const subject = getSubject(sid);
  if (!course || !subject) return notFoundView();

  const [profile, topics, releasedRows, studiedRows, sessions] = await Promise.all([
    getProfile(pid),
    loadTopics(cid, sid),
    listReleased(pid, { subjectId: sid }),
    listStudied(pid, { subjectId: sid }).catch(() => []),
    listSessions(pid, { subjectId: sid }).catch(() => []),
  ]);
  if (!profile) return notFoundView();

  const t = texts(subject.lang);
  const progress = buildProgress(topics, studiedRows, sessions, releasedRows);

  const tabLink = (id, label) =>
    h('a', { class: 'tabs__tab', href: paths.subject(pid, cid, sid, id), 'aria-current': activeTab === id ? 'page' : null }, label);

  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: subject.name, sub: subject.lang === 'en' ? 'In English' : 'En español', back: paths.course(pid, cid), profile }),
    h(
      'div',
      { class: 'screen__body' },
      h('nav', { class: 'tabs', 'aria-label': subject.name }, tabLink('study', t.study), tabLink('practice', t.practice)),
      h('p', { class: 'lead' }, activeTab === 'study' ? t.pickStudy : t.pickPractice),
      topics.length === 0 ? h('p', { class: 'note note--empty' }, t.noTopics) : null,
      topicsSummary({ tab: activeTab, subject, topics, progress, t }),
      h('div', { class: 'topic-list' }, topics.map((topic, index) => topicCard({ profile, course, subject, tab: activeTab, topic, index, t, progress }))),
    ),
  );
}
