import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { getCourse, getSubject, loadTopic } from '../../content/registry.js';
import { getProfile } from '../../data/profiles.repo.js';
import { listStudied, markStudied } from '../../data/study.repo.js';
import { isTopicReleased } from '../subjects/topic-access.js';
import { appHeader } from '../../shared/app-header.js';
import { texts } from '../../shared/i18n.js';
import { lockedView } from '../../shared/locked-view.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { celebrateStudied } from '../points/ui/celebrate-studied.js';
import { notifyParents } from '../push/parent-alerts/notify-parents.js';
import { studiedMessage } from '../push/parent-alerts/parent-messages.js';
import { renderBlocks } from './lesson-blocks.js';
import { studiedButton } from './studied-button.js';

/** Lección de un tema. */
export async function studyScreen({ pid, cid, sid, tid }) {
  const course = getCourse(cid);
  const subject = getSubject(sid);
  if (!course || !subject) return notFoundView();

  const [profile, loaded, released, studiedRows] = await Promise.all([
    getProfile(pid),
    loadTopic(cid, sid, tid),
    isTopicReleased(pid, sid, tid),
    listStudied(pid, { subjectId: sid }).catch(() => []),
  ]);
  if (!profile || !loaded) return notFoundView();

  const t = texts(subject.lang);
  const { topic, study, exercises } = loaded;
  if (!released) return lockedView({ t, subject, profile, topic, back: paths.subject(pid, cid, sid, 'study') });

  return h(
    'main',
    { class: 'screen', style: { '--tint': subject.tint, '--deep': subject.deep } },
    appHeader({ title: topic.title, sub: subject.name, back: paths.subject(pid, cid, sid, 'study'), profile }),
    h(
      'article',
      { class: 'screen__body lesson', lang: subject.lang },
      ...renderBlocks(study, { speak: subject.lang === 'en' }),
      h(
        'div',
        { class: 'lesson__actions' },
        studiedButton({
          t,
          studied: studiedRows.some((row) => row.topic_id === tid),
          onMark: async () => {
            const { queued } = await markStudied({ profileId: pid, courseId: cid, subjectId: sid, topicId: tid });
            if (!queued) notifyParents(studiedMessage({ name: profile.name, topicTitle: topic.title, subjectName: subject.name }));
            await celebrateStudied({ profile, queued, topicTitle: topic.title });
            return { celebrated: true };
          },
        }),
        exercises.length ? h('a', { class: 'btn btn--primary btn--block', href: paths.practice(pid, cid, sid, tid) }, t.goPractice) : null,
      ),
    ),
  );
}
