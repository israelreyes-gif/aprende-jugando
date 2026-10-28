import { h } from '../../core/dom.js';

function metaText(tab, topic, t, progress) {
  if (!topic.available) return `🔜 ${t.soon}`;
  if (!progress.released.has(topic.id)) return `🔒 ${t.locked}`;
  if (tab === 'study') return progress.studied.has(topic.id) ? `✅ ${t.studied}` : `⏱ ${t.minutes(topic.minutes ?? 5)}`;
  const best = progress.best.get(topic.id);
  return best ? `⭐ ${t.best(best.correct, best.total)}` : `🎮 ${t.untried}`;
}

/** Línea de datos bajo el título: minutos, estudiado, mejor nota… y "A reforzar" si toca. */
export function topicMeta(tab, topic, state, t, progress) {
  const reinforce = tab === 'practice' && (state === 'red' || state === 'orange');
  return h('span', { class: 'topic-card__meta' }, metaText(tab, topic, t, progress), reinforce ? h('span', { class: 'topic-card__tag' }, t.reinforce) : null);
}
