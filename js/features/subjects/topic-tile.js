import { h } from '../../core/dom.js';

/** Cuadro con el emoji del tema (o su número si el tema no tiene emoji). */
export function topicTile(topic, index) {
  return h('span', { class: 'topic-card__tile', 'aria-hidden': 'true' }, topic.emoji || String(index + 1));
}
