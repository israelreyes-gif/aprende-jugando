import { h } from '../../../core/dom.js';

/** Tres cifras de resumen: ejercicios, acierto medio y días de racha del reto diario. */
export function summaryChips(summary) {
  const items = [
    { value: String(summary.questions), label: 'Ejercicios hechos' },
    { value: summary.pct == null ? '–' : `${summary.pct}%`, label: 'Acierto medio' },
    { value: String(summary.streak), label: 'Días de racha' },
  ];
  return h(
    'div',
    { class: 'grid-3' },
    items.map((item) => h('div', { class: 'stat-chip' }, h('span', { class: 'stat-chip__value' }, item.value), h('span', { class: 'stat-chip__label' }, item.label))),
  );
}
