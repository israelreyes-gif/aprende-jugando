import { h } from '../../core/dom.js';
import { paths } from '../../core/paths.js';
import { notify } from '../../shared/modal.js';
import { cardState } from './topic-state.js';
import { topicAction } from './topic-action.js';
import { topicMeta } from './topic-meta.js';
import { topicTile } from './topic-tile.js';

/** Tarjeta de un tema: enlace a Estudio o Ejercicios; con aviso si aún no tiene contenido o no está liberado. */
export function topicCard({ profile, course, subject, tab, topic, index, t, progress }) {
  const style = { '--tint': subject.tint, '--deep': subject.deep };
  const state = cardState(tab, topic, progress);

  const content = [
    topicTile(topic, index),
    h('span', { class: 'topic-card__text' }, h('span', { class: 'topic-card__title' }, topic.title), topicMeta(tab, topic, state, t, progress)),
    topicAction(tab, topic, state, t, progress),
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
