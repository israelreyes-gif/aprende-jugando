import { saveRetoAnswers } from '../../data/reto/save-answers.js';

/**
 * Guarda las respuestas del reto una tras otra (sin que se pisen).
 * Si un guardado falla, avisa con onError y el siguiente vuelve a enviar todo lo respondido.
 * flush() espera a que termine lo pendiente.
 */
export function answersSaver(retoId, onError) {
  let chain = Promise.resolve();
  return {
    save(answers) {
      const snapshot = answers.slice();
      chain = chain.then(() => saveRetoAnswers(retoId, snapshot)).catch(onError);
    },
    flush: () => chain,
  };
}
