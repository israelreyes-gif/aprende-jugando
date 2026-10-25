import { h } from '../../../core/dom.js';
import { paths } from '../../../core/paths.js';
import { getSubject } from '../../../content/registry.js';
import { icon } from '../../../shared/icons.js';
import { tone } from './tone.js';

/** Una fila por asignatura con "X de Y estudiados"; al tocarla se abre el detalle por temas. */
export function progressRows(profile, course, entries) {
  return entries.map((entry) => {
    const subject = getSubject(entry.subjectId);
    const text = entry.released === 0 ? 'Sin temas liberados' : `${entry.studied} de ${entry.released} estudiados`;
    const pct = entry.released === 0 ? 0 : Math.round((entry.studied * 100) / entry.released);
    return h(
      'a',
      { class: 'progress-row', href: paths.subjectStats(profile.id, course.id, subject.id), style: tone(subject), 'aria-label': `${subject.name}: ${text}` },
      h('span', { class: 'tile tile--sm' }, icon(subject.id, 24)),
      h(
        'div',
        { class: 'stat-row__main' },
        h('div', { class: 'stat-row__head' }, h('span', {}, subject.name), h('span', { class: 'stat-row__value' }, text)),
        h('div', { class: 'progress', role: 'img', 'aria-label': text }, h('div', { class: 'progress__bar', style: { '--value': `${pct}%` } })),
      ),
      h('span', { class: 'row-card__chev' }, icon('chevron')),
    );
  });
}
