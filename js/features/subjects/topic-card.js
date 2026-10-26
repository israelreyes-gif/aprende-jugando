import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { icon } from '../../shared/icons.js';
import { notify } from '../../shared/modal.js';

function topicMeta(tab, topic, t, progress) {
  if (!topic.available) return h('span', { class: 'topic-card__meta' }, t.soon);
  if (!progress.released.has(topic.id)) return h('span', { class: 'topic-card__meta' }, t.unavailable);
  if (tab === 'study') {
    const studied = progress.studied.has(topic.id);
    return h('span', { class: 'topic-card__meta' }, studied ? [icon('check', 16), t.studied] : t.minutes(topic.minutes ?? 5));
  }
  const best = progress.best.get(topic.id);
  return h('span', { class: 'topic-card__meta' }, best ? t.best(best.correct, best.total) : t.untried);
}

/**
 * Estado visual de la tarjeta:
 * locked (sin contenido o sin liberar), done (estudiado, solo en Estudio),
 * red / orange (necesita refuerzo, solo en Ejercicios) u open.
 */
function cardState(tab, topic, progress) {
  if (!topic.available || !progress.released.has(topic.id)) return 'locked';
  if (tab === 'study') return progress.studied.has(topic.id) ? 'done' : 'open';
  return progress.level.get(topic.id) || 'open';
}

function topicBadge(state, index) {
  if (state === 'locked') return h('span', { class: 'topic-card__num' }, icon('lock', 20));
  if (state === 'done') return h('span', { class: 'topic-card__num' }, icon('check', 22));
  return h('span', { class: 'topic-card__num' }, String(index + 1));
}

/** Tarjeta de un tema: enlace a Estudio o Ejercicios; con aviso si aún no tiene contenido o no está liberado. */
export function topicCard({ profile, course, subject, tab, topic, index, t, progress }) {
  const style = { '--tint': subject.tint, '--deep': subject.deep };
  const state = cardState(tab, topic, progress);

  const content = [
    topicBadge(state, index),
    h('span', { class: 'stack', style: { '--gap': '4px' } }, h('span', { class: 'topic-card__title' }, topic.title), topicMeta(tab, topic, t, progress)),
  ];

  if (state === 'locked') {
    const notice = topic.available
      ? { title: t.unavailableTitle, message: t.unavailableText }
      : { title: t.soon, message: t.soonToast };
    const onClick = () => notify({ kind: 'info', ...notice, button: t.gotIt });
    return h('button', { class: 'card topic-card topic-card--locked', type: 'button', style, 'aria-disabled': 'true', onClick }, ...content);
  }

  const href = tab === 'study' ? paths.study(profile.id, course.id, subject.id, topic.id) : paths.practice(profile.id, course.id, subject.id, topic.id);
  return h('a', { class: `card topic-card topic-card--${state}`, href, style }, ...content);
}
