import { h } from '../../../core/dom.js';
import { icon } from '../../../shared/icons.js';

function statusTag(entry) {
  if (!entry.released) return h('span', { class: 'topic-stat__tag topic-stat__tag--off' }, [icon('lock', 14), 'No liberado']);
  if (entry.studied) return h('span', { class: 'topic-stat__tag topic-stat__tag--ok' }, [icon('check', 14), 'Estudiado']);
  return h('span', { class: 'topic-stat__tag' }, 'Sin estudiar');
}

function levelTag(entry) {
  if (!entry.level) return null;
  const label = entry.level === 'red' ? 'Refuerzo' : 'Casi';
  return h('span', { class: `topic-stat__tag topic-stat__tag--${entry.level}` }, `${label} · ${entry.recentPct}%`);
}

function practiceLine(entry) {
  if (entry.attempts === 0) return entry.recentPct == null ? 'Sin ejercicios todavía' : `Solo preguntas del reto · últimas 24: ${entry.recentPct}%`;
  const times = entry.attempts === 1 ? '1 intento' : `${entry.attempts} intentos`;
  return `${times} · mejor ${entry.best.correct}/${entry.best.total} · últimas 24: ${entry.recentPct}%`;
}

/** Fila de un tema en el detalle de una asignatura; se tiñe de rojo o naranja si necesita refuerzo. */
export function topicStatRow(entry) {
  const classes = ['topic-stat', entry.released ? '' : 'topic-stat--off', entry.level ? `topic-stat--${entry.level}` : ''].filter(Boolean).join(' ');
  return h(
    'div',
    { class: classes },
    h('div', { class: 'topic-stat__head' }, h('span', { class: 'topic-stat__title' }, entry.title), h('span', { class: 'topic-stat__tags' }, levelTag(entry), statusTag(entry))),
    h('p', { class: 'topic-stat__line' }, practiceLine(entry)),
  );
}
