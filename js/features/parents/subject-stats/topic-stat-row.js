import { h } from '../../../core/dom.js';
import { icon } from '../../../shared/icons.js';

function tag(entry) {
  if (!entry.released) return h('span', { class: 'topic-stat__tag topic-stat__tag--off' }, [icon('lock', 14), 'No liberado']);
  if (entry.studied) return h('span', { class: 'topic-stat__tag topic-stat__tag--ok' }, [icon('check', 14), 'Estudiado']);
  return h('span', { class: 'topic-stat__tag' }, 'Sin estudiar');
}

function practiceLine(entry) {
  if (entry.attempts === 0) return 'Sin ejercicios todavía';
  const times = entry.attempts === 1 ? '1 intento' : `${entry.attempts} intentos`;
  return `${times} · mejor ${entry.best.correct}/${entry.best.total} · media ${entry.pct}%`;
}

/** Fila de un tema en el detalle de una asignatura. */
export function topicStatRow(entry) {
  return h(
    'div',
    { class: `topic-stat${entry.released ? '' : ' topic-stat--off'}` },
    h('div', { class: 'topic-stat__head' }, h('span', { class: 'topic-stat__title' }, entry.title), tag(entry)),
    h('p', { class: 'topic-stat__line' }, practiceLine(entry)),
  );
}
