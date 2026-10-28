import { h } from '../../core/dom.js';
import { texts } from '../../shared/i18n.js';
import { streakBadge } from './streak-badge.js';

/** Resultado del reto: nota, racha y las preguntas falladas para repasar. Devuelve la lista de nodos. */
export function retoResultView({ answers, streak, backHref, pointsNode }) {
  const t = texts('es');
  const correct = answers.filter((a) => a.correct).length;
  const total = answers.length;
  const pct = total ? Math.round((correct * 100) / total) : 0;
  const missed = answers.filter((a) => !a.correct);

  return [
    h(
      'div',
      { class: 'stack result', style: { '--gap': '14px' } },
      h('p', { class: 'title-lg' }, t.resultTitle(pct)),
      h('p', { class: 'result__score' }, `${correct}/${total}`),
      pointsNode,
      streak > 0 ? h('div', { class: 'reto-streak' }, streakBadge(streak), h('p', { class: 'lead' }, '¡Vuelve mañana para seguir la racha!')) : null,
      missed.length
        ? h(
            'div',
            { class: 'result__list' },
            h('h2', { class: 'title-lg' }, t.toReview),
            missed.map((a) => h('div', { class: 'result__item' }, a.prompt, h('span', {}, `${t.answerWas}: ${a.answerText}`))),
          )
        : null,
    ),
    h('a', { class: 'btn btn--primary btn--block', href: backHref }, 'Volver a las asignaturas'),
  ];
}
