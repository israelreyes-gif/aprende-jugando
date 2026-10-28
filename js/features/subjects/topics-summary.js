import { h } from '../../core/dom.js';

/** Resumen sobre la lista: "4 de 13 temas estudiados" (Estudio) o "5 de 13 temas practicados" (Ejercicios), con su barra. */
export function topicsSummary({ tab, subject, topics, progress, t }) {
  const usable = topics.filter((topic) => topic.available);
  if (usable.length === 0) return null;
  const done = usable.filter((topic) => (tab === 'study' ? progress.studied.has(topic.id) : progress.best.get(topic.id))).length;
  const text = tab === 'study' ? `📖 ${t.studiedCount(done, usable.length)}` : `✏️ ${t.triedCount(done, usable.length)}`;
  return h(
    'div',
    { class: 'topics-summary', style: { '--deep': subject.deep } },
    h('b', {}, text),
    h('span', { class: 'topics-summary__bar' }, h('i', { style: { width: `${Math.round((done / usable.length) * 100)}%` } })),
  );
}
