import { h } from '../../core/dom.js';
import { icon } from '../../shared/icons.js';
import { progressRing } from './progress-ring.js';

/** Lo que va a la derecha de la tarjeta: candado, botón (Estudio) o anillo con el % reciente (Ejercicios). */
export function topicAction(tab, topic, state, t, progress) {
  if (state === 'locked') return h('span', { class: 'topic-card__lock' }, icon('lock', 18));
  if (tab === 'study') {
    return h('span', { class: `topic-card__pill${state === 'done' ? ' topic-card__pill--done' : ''}` }, state === 'done' ? t.review : t.read);
  }
  // El anillo enseña el mismo porcentaje que usa la regla del 75 % (últimas preguntas), no la mejor nota.
  return progressRing(progress.recent.get(topic.id));
}
