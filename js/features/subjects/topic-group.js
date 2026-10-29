import { h } from '../../core/dom.js';

/** Un grupo de temas: con título de unidad y fondo suave si tiene `unit`; si no, solo la lista de tarjetas. */
export function topicGroup({ unit, subject, cards }) {
  if (!unit) return h('div', { class: 'topic-list' }, cards);
  return h(
    'section',
    { class: 'topic-group', style: { '--tint': subject.tint, '--deep': subject.deep }, 'aria-label': unit },
    h('h2', { class: 'topic-group__title' }, unit),
    h('div', { class: 'topic-list topic-list--tight' }, cards),
  );
}
