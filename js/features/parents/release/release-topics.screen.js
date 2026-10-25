import { h } from '../../../core/dom.js';
import { paths } from '../../../core/paths.js';
import { getCourse, getSubject, loadTopics } from '../../../content/registry.js';
import { getProfile } from '../../../data/profiles.repo.js';
import { listReleased } from '../../../data/release.repo.js';
import { appHeader } from '../../../shared/app-header.js';
import { notFoundView } from '../../../shared/not-found-view.js';
import { withParentsGate } from '../pin-gate.js';
import { topicSwitchRow } from './topic-switch-row.js';

async function renderReleaseTopics({ pid, cid, sid }) {
  const course = getCourse(cid);
  const subject = getSubject(sid);
  if (!course || !subject) return notFoundView();

  const [profile, topics, rows] = await Promise.all([getProfile(pid), loadTopics(cid, sid), listReleased(pid, { subjectId: sid })]);
  if (!profile) return notFoundView();

  const released = new Set(rows.filter((r) => r.course_id === cid).map((r) => r.topic_id));
  const withContent = topics.filter((t) => t.available);
  let count = withContent.filter((t) => released.has(t.id)).length;
  const counter = h('p', { class: 'lead' });
  const showCount = () => {
    counter.textContent = `${count} de ${withContent.length} temas disponibles para ${profile.name}.`;
  };
  showCount();

  const onCount = (delta) => {
    count += delta;
    showCount();
  };

  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: subject.name, sub: `Liberar temas · ${profile.name}`, back: paths.release(pid, cid), profile }),
    h(
      'div',
      { class: 'screen__body' },
      counter,
      topics.length === 0 ? h('p', { class: 'note note--empty' }, 'Esta asignatura aún no tiene temas.') : null,
      h('div', { class: 'stack' }, topics.map((topic) => topicSwitchRow({ profile, course, subject, topic, released: released.has(topic.id), onCount }))),
    ),
  );
}

export function releaseTopicsScreen(params) {
  return withParentsGate(() => renderReleaseTopics(params));
}
