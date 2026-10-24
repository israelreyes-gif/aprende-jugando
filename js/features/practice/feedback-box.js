import { h } from '../../core/dom.js';
import { icon } from '../../shared/icons.js';

/** Cuadro de corrección que aparece tras comprobar una respuesta. */
export function feedbackBox(ok, q, type, t) {
  return h(
    'div',
    { class: `feedback ${ok ? 'feedback--ok' : 'feedback--bad'}` },
    h('div', { class: 'feedback__title' }, icon(ok ? 'check' : 'close', 22), ok ? t.correct : t.wrong),
    ok ? null : h('div', {}, `${t.answerWas}: `, h('strong', {}, type.answerText(q))),
    q.explain ? h('p', { style: { marginTop: '6px' } }, q.explain) : null,
  );
}
