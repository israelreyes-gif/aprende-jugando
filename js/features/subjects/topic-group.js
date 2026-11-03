import { h } from '../../core/dom.js';

/** Un grupo de temas. Con `unit` es una sección plegable (cerrada al entrar) con el número de temas; si no, solo la lista de tarjetas. `extra` (opcional): tarjetas que van al final y no cuentan como temas (el mix). */
export function topicGroup({ unit, subject, cards, extra = [] }) {
  if (!unit) return h('div', { class: 'topic-list' }, cards, extra);
  return h(
    'details',
    { class: 'topic-group', style: { '--tint': subject.tint, '--deep': subject.deep } },
    h('summary', { class: 'topic-group__title' }, h('span', { class: 'topic-group__name' }, unit), h('span', { class: 'topic-group__count' }, `${cards.length} ${cards.length === 1 ? 'tema' : 'temas'}`)),
    h('div', { class: 'topic-list topic-list--tight' }, cards, extra),
  );
}
