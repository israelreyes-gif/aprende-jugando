import { h } from '../../../core/dom.js';
import { getSubject } from '../../../content/registry.js';
import { icon } from '../../../shared/icons.js';
import { tone } from './tone.js';

/** Una fila por asignatura con su porcentaje de aciertos. */
export function subjectRows(bySubject) {
  return bySubject.map((entry) => {
    const subject = getSubject(entry.subjectId);
    const pct = entry.pct;
    return h(
      'div',
      { class: 'stat-row', style: tone(subject) },
      h('span', { class: 'tile tile--sm' }, icon(subject.id, 24)),
      h(
        'div',
        { class: 'stat-row__main' },
        h('div', { class: 'stat-row__head' }, h('span', {}, subject.name), h('span', { class: 'stat-row__value' }, pct == null ? 'Sin datos' : `${pct}%`)),
        h('div', { class: 'progress', role: 'img', 'aria-label': pct == null ? 'Sin datos' : `${pct}% de aciertos` }, h('div', { class: 'progress__bar', style: { '--value': `${pct ?? 0}%` } })),
      ),
    );
  });
}
