import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { icon } from '../../shared/icons.js';
import { toast } from '../../shared/toast.js';

function topicMeta(tab, topic, t, progress) {
  if (!topic.available) return h('span', { class: 'topic-card__meta' }, t.soon);
  if (!progress.released.has(topic.id)) return h('span', { class: 'topic-card__meta' }, [icon('lock', 16), t.unavailable]);
  if (tab === 'study') {
    const studied = progress.studied.has(topic.id);
    return h('span', { class: 'topic-card__meta' }, studied ? [icon('check', 16), t.studied] : t.minutes(topic.minutes ?? 5));
  }
  const best = progress.best.get(topic.id);
  return h('span', { class: 'topic-card__meta' }, best ? t.best(best.correct, best.total) : t.untried);
}

/** Tarjeta de un tema: enlace a Estudio o Ejercicios; con aviso si aún no tiene contenido o no está liberado. */
export function topicCard({ profile, course, subject, tab, topic, index, t, progress }) {
  const content = [
    h('span', { class: 'topic-card__num' }, String(index + 1)),
    h('span', { class: 'stack', style: { '--gap': '4px' } }, h('span', { class: 'topic-card__title' }, topic.title), topicMeta(tab, topic, t, progress)),
  ];
  const style = { '--tint': subject.tint, '--deep': subject.deep };
  const locked = (message) =>
    h('button', { class: 'card topic-card topic-card--locked', type: 'button', style, 'aria-disabled': 'true', onClick: () => toast(message) }, ...content);

  if (!topic.available) return locked(t.soonToast);
  if (!progress.released.has(topic.id)) return locked(t.unavailableToast);

  const href = tab === 'study' ? paths.study(profile.id, course.id, subject.id, topic.id) : paths.practice(profile.id, course.id, subject.id, topic.id);
  return h('a', { class: 'card topic-card', href, style }, ...content);
}
