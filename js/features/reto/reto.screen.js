import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { getCourse } from '../../content/registry.js';
import { getProfile } from '../../data/profiles.repo.js';
import { getReto } from '../../data/reto/get-reto.js';
import { startReto } from '../../data/reto/start-reto.js';
import { finishReto } from '../../data/reto/finish-reto.js';
import { appHeader } from '../../shared/app-header.js';
import { notify } from '../../shared/modal.js';
import { notFoundView } from '../../shared/not-found-view.js';
import { pointsBurst } from '../points/ui/points-burst.js';
import { reportPoints } from '../points/ui/report-points.js';
import { sessionPoints } from '../points/session-points.js';
import { notifyParents } from '../push/parent-alerts/notify-parents.js';
import { retoMessage } from '../push/parent-alerts/parent-messages.js';
import { answersSaver } from './answers-saver.js';
import { loadRetoStatus } from './reto-status.js';
import { loadRetoTopics } from './load-reto-topics.js';
import { materializePlan } from './plan/materialize-plan.js';
import { planReto } from './plan/plan-reto.js';
import { retoEmptyText } from './reto-empty-text.js';
import { retoQuestions } from './reto-questions.js';
import { retoResultView } from './reto-result-view.js';
import { spainDay } from './streak/date-keys.js';

/** Reto de hoy: 10 preguntas mezcladas de los temas liberados y estudiados. Se puede dejar a medias y retomar. */
export async function retoScreen({ pid, cid }) {
  const course = getCourse(cid);
  const profile = await getProfile(pid);
  if (!profile || !course || !course.available) return notFoundView();

  const back = paths.course(pid, cid);
  const today = spainDay();
  const [topics, existing] = await Promise.all([loadRetoTopics(pid, cid), getReto(pid, today)]);

  const body = h('div', { class: 'screen__body practice' });
  const view = h('main', { class: 'screen' }, appHeader({ title: 'Reto de hoy', sub: profile.name, back, profile }), body);
  const backLink = h('a', { class: 'btn btn--outline btn--block', href: back }, 'Volver a las asignaturas');
  const emptyView = (text) => body.replaceChildren(h('p', { class: 'note note--empty' }, text), backLink);

  async function showResult(answers, pointsNode) {
    const status = await loadRetoStatus(pid).catch(() => null);
    body.replaceChildren(...retoResultView({ answers, streak: status?.streak ?? 0, backHref: back, pointsNode }));
    window.scrollTo(0, 0);
  }

  if (existing?.finished) {
    await showResult(existing.answers);
    return view;
  }
  if (!existing && topics.length === 0) {
    emptyView(await retoEmptyText(pid, cid));
    return view;
  }

  const reto = existing || (await startReto({ profileId: pid, courseId: cid, day: today, plan: planReto(topics) }));
  if (reto.finished) {
    await showResult(reto.answers);
    return view;
  }

  const questions = materializePlan(reto.plan, topics).slice(reto.answers.length);
  if (questions.length === 0 && reto.answers.length === 0) {
    emptyView('Hoy no hay preguntas disponibles para el reto.');
    return view;
  }

  const saver = answersSaver(reto.id, () => notify({ kind: 'error', title: 'No se pudo guardar', message: 'Revisa la conexión. Sigue con el reto: se guardará después.' }));

  async function finish(answers) {
    body.replaceChildren(h('p', { class: 'lead', role: 'status' }, 'Guardando el resultado…'));
    try {
      await saver.flush();
      await finishReto({ ...reto, answers });
    } catch (err) {
      console.error(err);
      body.replaceChildren(
        h('p', { class: 'note note--empty' }, 'No se ha podido guardar el reto. Revisa la conexión.'),
        h('button', { class: 'btn btn--primary btn--block', type: 'button', onClick: () => finish(answers) }, 'Reintentar'),
      );
      return;
    }
    if (answers.length) notifyParents(retoMessage({ name: profile.name, answers }));
    const result = sessionPoints(answers.filter((a) => a.correct).length, answers.length);
    const burst = answers.length ? pointsBurst({ result }) : null;
    await showResult(answers, burst?.node);
    if (burst) reportPoints({ profile, delta: result.total, queued: false, burst });
  }

  if (questions.length === 0) await finish(reto.answers);
  else retoQuestions({ body, answers: reto.answers, questions, onAnswered: (all) => saver.save(all), onDone: finish });
  return view;
}
