import { h } from '../../core/dom.js';
import { visualNode } from '../../exercises/visual.js';
import { feedbackBox } from './feedback-box.js';
import { progressMeter } from './progress-meter.js';
import { questionTypes } from './question-types.js';

/**
 * Una pregunta: enunciado, campo de respuesta, corrección y botón Comprobar/Siguiente.
 * onChecked(resultado) se llama al comprobar; onContinue() al pulsar Siguiente.
 * Devuelve { nodes, focus }.
 */
export function questionView({ q, index, total, t, onChecked, onContinue }) {
  const type = questionTypes[q.type];
  let value = null;
  let checked = false;

  const action = h('button', { class: 'btn btn--primary btn--block', type: 'button', disabled: true }, t.check);
  const feedback = h('div', { 'aria-live': 'polite' });

  const widget = type.render(q, {
    t,
    onChange: (next) => {
      if (checked) return;
      value = next;
      action.disabled = next == null;
    },
    onSubmit: () => {
      if (!action.disabled) action.click();
    },
  });

  action.addEventListener('click', () => {
    if (checked) return onContinue();
    checked = true;
    const ok = type.check(q, value);
    onChecked({ questionId: q.id, correct: ok, given: type.givenText(q, value), prompt: q.prompt, answerText: type.answerText(q) });
    widget.lock();
    widget.reveal(ok, value);
    feedback.replaceChildren(feedbackBox(ok, q, type, t));
    action.textContent = index + 1 === total ? t.finish : t.next;
    action.focus();
  });

  const nodes = [
    progressMeter({ index, total, t }),
    h('div', { class: 'stack', style: { '--gap': '16px' } }, h('p', { class: 'question__prompt' }, q.prompt), q.visual ? visualNode(q.visual) : null, widget.el),
    feedback,
    action,
  ];
  return { nodes, focus: widget.focus };
}
