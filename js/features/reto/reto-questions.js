import { getSubject } from '../../content/registry.js';
import { texts } from '../../shared/i18n.js';
import { questionView } from '../practice/question-view.js';

/**
 * Muestra las preguntas del reto una a una, con corrección inmediata.
 * answers: lo ya respondido (si se retoma). questions: las que faltan por responder.
 * onAnswered(todas) se llama tras comprobar cada una; onDone(todas) al pasar de la última.
 * Cada pregunta usa el idioma de su asignatura (botones y textos).
 */
export function retoQuestions({ body, answers: done, questions, onAnswered, onDone }) {
  const answers = [...done];
  const total = answers.length + questions.length;
  let index = answers.length;

  function show() {
    const q = questions[index - done.length];
    const lang = getSubject(q.subjectId)?.lang || 'es';
    body.setAttribute('lang', lang);
    const view = questionView({
      q,
      index,
      total,
      t: texts(lang),
      onChecked: (result) => {
        answers.push({ ...result, subjectId: q.subjectId, topicId: q.topicId });
        onAnswered(answers);
      },
      onContinue: () => {
        index += 1;
        if (index < total) show();
        else onDone(answers);
      },
    });
    body.replaceChildren(...view.nodes);
    view.focus();
  }

  show();
}
