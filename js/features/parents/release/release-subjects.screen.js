import { h } from '../../../core/dom.js';
import { paths } from '../../../core/paths.js';
import { getCourse, subjectsOf, loadTopics } from '../../../content/registry.js';
import { getProfile } from '../../../data/profiles.repo.js';
import { listReleased } from '../../../data/release.repo.js';
import { appHeader } from '../../../shared/app-header.js';
import { notFoundView } from '../../../shared/not-found-view.js';
import { withParentsGate } from '../pin-gate.js';
import { subjectReleaseRow } from './subject-release-row.js';

async function renderReleaseSubjects({ pid, cid }) {
  const course = getCourse(cid);
  if (!course) return notFoundView();

  const subjects = subjectsOf(course);
  const [profile, rows, topicLists] = await Promise.all([getProfile(pid), listReleased(pid), Promise.all(subjects.map((s) => loadTopics(cid, s.id)))]);
  if (!profile) return notFoundView();

  const releasedKeys = new Set(rows.filter((r) => r.course_id === cid).map((r) => `${r.subject_id}|${r.topic_id}`));
  const items = subjects.map((subject, i) => {
    const withContent = topicLists[i].filter((t) => t.available);
    const released = withContent.filter((t) => releasedKeys.has(`${subject.id}|${t.id}`)).length;
    return subjectReleaseRow({ profile, course, subject, total: withContent.length, released });
  });

  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: 'Liberar temas', sub: `${profile.name} · ${course.title}`, back: paths.childStats(pid), profile }),
    h('div', { class: 'screen__body' }, h('p', { class: 'lead' }, 'Elige una asignatura y activa los temas que ya puede hacer.'), h('div', { class: 'stack' }, items)),
  );
}

export function releaseSubjectsScreen(params) {
  return withParentsGate(() => renderReleaseSubjects(params));
}
