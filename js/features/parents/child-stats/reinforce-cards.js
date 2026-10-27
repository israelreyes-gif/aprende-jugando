import { h } from '../../../core/dom.js';
import { getSubject } from '../../../content/registry.js';
import { tone } from './tone.js';

/** Tarjetas de los temas que necesitan refuerzo (solo informativas: el padre mira, no practica). */
export function reinforceCards(entries, topicTitles) {
  if (entries.length === 0) {
    return h('p', { class: 'note note--ok' }, 'Todo va bien: ningún tema necesita refuerzo ahora mismo.');
  }
  return h(
    'div',
    { class: 'stack' },
    entries.map((entry) => {
      const subject = getSubject(entry.subjectId);
      const title = topicTitles.get(`${entry.subjectId}|${entry.topicId}`) || entry.topicId;
      return h(
        'div',
        { class: 'reinforce-card' },
        h('div', { class: 'reinforce-card__head' }, h('span', { class: 'chip', style: tone(subject) }, subject.name), h('span', {}, `${entry.pct}% de aciertos`)),
        h('span', { class: 'reinforce-card__title' }, title),
      );
    }),
  );
}
