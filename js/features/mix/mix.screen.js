import { h } from '../../core/dom.js';
import { reload } from '../../core/router.js';
import { paths } from '../../core/paths.js';
import { getCourse, getSubject } from '../../content/registry.js';
import { findMix } from '../../content/mixes.js';
import { getProfile } from '../../data/profiles.repo.js';
import { saveMix } from '../../data/mix/save-mix.js';
import { appHeader } from '../../shared/app-header.js';
import { texts } from '../../shared/i18n.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { materializePlan } from '../reto/plan/materialize-plan.js';
import { planReto } from '../reto/plan/plan-reto.js';
import { retoQuestions } from '../reto/reto-questions.js';
import { mixMessage } from '../push/parent-alerts/parent-messages.js';
import { notifyParents } from '../push/parent-alerts/notify-parents.js';
import { pointsBurst } from '../points/ui/points-burst.js';
import { reportPoints } from '../points/ui/report-points.js';
import { sessionPoints } from '../points/session-points.js';
import { resultView } from '../practice/result-view.js';
import { loadMixPool } from './mix-pool.js';

/** Mix de preguntas de una unidad: `size` preguntas de sus temas estudiados, con corrección inmediata. Cuenta en las estadísticas de cada tema. */
export async function mixScreen({ pid, cid, sid, mid }) {
  const course = getCourse(cid);
  const subject = getSubject(sid);
  const mix = course && subject ? await findMix(cid, sid, mid) : null;
  if (!mix) return notFoundView();
  const profile = await getProfile(pid);
  if (!profile) return notFoundView();

  const t = texts(subject.lang);
  const back = paths.subject(pid, cid, sid, 'practice');
  const body = h('div', { class: 'screen__body practice', lang: subject.lang });
  const view = h(
    'main',
    { class: 'screen', style: { '--tint': subject.tint, '--deep': subject.deep } },
    appHeader({ title: mix.title, sub: subject.name, back, profile }),
    body,
  );

  const pool = await loadMixPool(pid, cid, sid, mix);
  if (pool.length === 0) {
    body.append(h('p', { class: 'note note--empty' }, t.mixEmpty), h('a', { class: 'btn btn--outline btn--block', href: back }, t.backToTopics));
    return view;
  }

  const questions = materializePlan(planReto(pool, mix.size), pool);
  const startedAt = Date.now();

  async function finish(answers) {
    const saveNote = h('p', { class: 'lead', role: 'status' }, t.mixSaving);
    const result = sessionPoints(answers.filter((a) => a.correct).length, answers.length);
    const burst = pointsBurst({ result });
    body.replaceChildren(...resultView({ results: answers, t, saveNote, pointsNode: burst.node, studyHref: paths.subject(pid, cid, sid, 'study'), topicsHref: back, onRetry: reload }));
    window.scrollTo(0, 0);
    try {
      const { queued } = await saveMix({ profileId: pid, courseId: cid, answers, durationS: (Date.now() - startedAt) / 1000 });
      saveNote.textContent = queued ? t.savedLater : t.saved;
      if (!queued) notifyParents(mixMessage({ name: profile.name, mixTitle: mix.title, subjectName: subject.name, answers }));
      reportPoints({ profile, delta: result.total, queued, burst });
    } catch (err) {
      console.error(err);
      saveNote.textContent = t.saveFailed;
    }
  }

  retoQuestions({ body, answers: [], questions, onAnswered: () => {}, onDone: finish });
  return view;
}
