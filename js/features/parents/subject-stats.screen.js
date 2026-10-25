import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { getCourse, getSubject, loadTopics } from '../../content/registry.js';
import { getProfile } from '../../data/profiles.repo.js';
import { listSessions } from '../../data/practice.repo.js';
import { listReleased } from '../../data/release.repo.js';
import { listStudied } from '../../data/study.repo.js';
import { appHeader } from '../../shared/app-header.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { topicStatRow } from './subject-stats/topic-stat-row.js';
import { topicStats } from './stats.logic.js';
import { withParentsGate } from './pin-gate.js';

async function renderSubjectStats({ pid, cid, sid }) {
  const course = getCourse(cid);
  const subject = getSubject(sid);
  if (!course || !subject) return notFoundView();

  const [profile, topics, releasedRows, studiedRows, sessions] = await Promise.all([
    getProfile(pid),
    loadTopics(cid, sid),
    listReleased(pid, { subjectId: sid }),
    listStudied(pid, { subjectId: sid }),
    listSessions(pid, { subjectId: sid }),
  ]);
  if (!profile) return notFoundView();

  const rows = topicStats(topics, cid, sid, releasedRows, studiedRows, sessions);
  const released = rows.filter((r) => r.released).length;
  const studied = rows.filter((r) => r.released && r.studied).length;

  return h(
    'main',
    { class: 'screen' },
    appHeader({ title: subject.name, sub: `Detalle · ${profile.name}`, back: paths.childStats(pid), profile }),
    h(
      'div',
      { class: 'screen__body' },
      h('p', { class: 'lead' }, `${released} de ${rows.length} temas liberados · ${studied} estudiados.`),
      rows.length === 0 ? h('p', { class: 'note note--empty' }, 'Esta asignatura aún no tiene temas con contenido.') : null,
      h('div', { class: 'stack' }, rows.map(topicStatRow)),
    ),
  );
}

export function subjectStatsScreen(params) {
  return withParentsGate(() => renderSubjectStats(params));
}
