import { h } from '../../core/dom.js';

/** Resultado final de la sesión. Devuelve la lista de nodos a pintar. */
export function resultView({ results, t, saveNote, pointsNode, studyHref, topicsHref, onRetry }) {
  const correct = results.filter((r) => r.correct).length;
  const total = results.length;
  const pct = Math.round((correct * 100) / total);
  const missed = results.filter((r) => !r.correct);

  return [
    h(
      'div',
      { class: 'stack result', style: { '--gap': '14px' } },
      h('p', { class: 'title-lg' }, t.resultTitle(pct)),
      h('p', { class: 'result__score' }, `${correct}/${total}`),
      pointsNode,
      h('p', { class: 'lead' }, t.resultNote(pct)),
      saveNote,
      missed.length
        ? h(
            'div',
            { class: 'result__list' },
            h('h2', { class: 'title-lg' }, t.toReview),
            missed.map((r) => h('div', { class: 'result__item' }, r.prompt, h('span', {}, `${t.answerWas}: ${r.answerText}`))),
          )
        : null,
    ),
    h('button', { class: 'btn btn--primary btn--block', type: 'button', onClick: onRetry }, t.retry),
    h('a', { class: 'btn btn--outline btn--block', href: studyHref }, t.reviewTheory),
    h('a', { class: 'btn btn--outline btn--block', href: topicsHref }, t.backToTopics),
  ];
}
