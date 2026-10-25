import { h } from '../../core/dom.js';
import { reload } from '../../core/router.js';
import { paths } from '../../core/paths.js';
import { getCourse, getSubject, loadTopic } from '../../content/registry.js';
import { getProfile } from '../../data/profiles.repo.js';
import { savePractice } from '../../data/practice.repo.js';
import { buildSession } from '../../exercises/session.js';
import { appHeader } from '../../shared/app-header.js';
import { texts } from '../../shared/i18n.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { questionView } from './question-view.js';
import { resultView } from './result-view.js';

/** Sesión de ejercicios de un tema: pregunta a pregunta, con corrección inmediata. */
export async function practiceScreen({ pid, cid, sid, tid }) {
  const course = getCourse(cid);
  const subject = getSubject(sid);
  if (!course || !subject) return notFoundView();

  const [profile, loaded] = await Promise.all([getProfile(pid), loadTopic(cid, sid, tid)]);
  if (!profile || !loaded) return notFoundView();

  const t = texts(subject.lang);
  const { topic, exercises } = loaded;
  const topicsHref = paths.subject(pid, cid, sid, 'practice');

  const body = h('div', { class: 'screen__body practice', lang: subject.lang });
  const view = h(
    'main',
    { class: 'screen', style: { '--tint': subject.tint, '--deep': subject.deep } },
    appHeader({ title: topic.title, sub: subject.name, back: topicsHref, profile }),
    body,
  );

  if (exercises.length === 0) {
    body.append(h('p', { class: 'note note--empty' }, t.noExercises), h('a', { class: 'btn btn--outline btn--block', href: topicsHref }, t.backToTopics));
    return view;
  }

  const questions = buildSession(exercises);
  const results = [];
  const startedAt = Date.now();
  let index = 0;

  function showQuestion() {
    const question = questionView({
      q: questions[index], index, total: questions.length, t,
      onChecked: (result) => results.push(result),
      onContinue: () => {
        index += 1;
        if (index < questions.length) showQuestion();
        else showResult();
      },
    });
    body.replaceChildren(...question.nodes);
    question.focus();
  }

  function showResult() {
    const saveNote = h('p', { class: 'lead', role: 'status' }, '…');
    savePractice({ profileId: pid, courseId: cid, subjectId: sid, topicId: tid, results, durationS: (Date.now() - startedAt) / 1000 })
      .then(({ queued }) => (saveNote.textContent = queued ? t.savedLater : t.saved))
      .catch((err) => {
        console.error(err);
        saveNote.textContent = t.saveFailed;
      });

    body.replaceChildren(...resultView({ results, t, saveNote, studyHref: paths.study(pid, cid, sid, tid), topicsHref, onRetry: reload }));
    window.scrollTo(0, 0);
  }

  showQuestion();
  return view;
}
