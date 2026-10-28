import { h } from '../../../core/dom.js';

/** Barra con el porcentaje del curso. percent: { studied, total, pct, missing }. onCard: dentro de la tarjeta de nivel. */
export function courseMeter(percent, { onCard = false } = {}) {
  const text = `Curso ${percent.pct} %`;
  return h(
    'span',
    { class: `course-meter${onCard ? ' course-meter--card' : ''}`, role: 'img', 'aria-label': `${text}. ${percent.studied} de ${percent.total} temas estudiados` },
    h('span', { class: 'course-meter__head' }, h('b', {}, `📚 ${text}`), h('span', {}, percent.missing ? `te falta ${percent.missing} %` : '¡completo! 🎉')),
    h('span', { class: 'course-meter__bar' }, h('i', { style: { width: `${percent.pct}%` } })),
    onCard ? null : h('span', { class: 'course-meter__detail' }, `${percent.studied} de ${percent.total} temas estudiados`),
  );
}
