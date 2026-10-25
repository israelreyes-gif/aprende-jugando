import { h } from '../../../core/dom.js';
import { paths } from '../../../core/paths.js';
import { icon } from '../../../shared/icons.js';
import { tone } from '../child-stats/tone.js';

/** Fila de una asignatura con "X de Y temas disponibles". */
export function subjectReleaseRow({ profile, course, subject, total, released }) {
  return h(
    'a',
    { class: 'card row-card', href: paths.releaseSubject(profile.id, course.id, subject.id), style: tone(subject) },
    h('span', { class: 'tile tile--sm' }, icon(subject.id, 24)),
    h('span', { class: 'row-card__text' }, h('span', { class: 'row-card__title' }, subject.name), h('span', { class: 'muted', style: { fontWeight: '700', fontSize: '14px' } }, total === 0 ? 'Sin temas todavía' : `${released} de ${total} disponibles`)),
    h('span', { class: 'row-card__chev' }, icon('chevron')),
  );
}
