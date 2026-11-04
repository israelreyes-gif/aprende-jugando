import { saveRetoAnswers } from '../../data/reto/save-answers.js';

/**
 * Guarda las respuestas del reto una tras otra (sin que se pisen).
 * Si un guardado falla, avisa con onError y el siguiente vuelve a enviar todo lo respondido.
 * getRetoId() devuelve (o promete) el id del reto: puede tardar si el reto aún se está creando.
 * flush() espera a que termine lo pendiente.
 */
export function answersSaver(getRetoId, onError) {
  let chain = Promise.resolve();
  return {
    save(answers) {
      const snapshot = answers.slice();
      chain = chain.then(async () => saveRetoAnswers(await getRetoId(), snapshot)).catch(onError);
    },
    flush: () => chain,
  };
}
