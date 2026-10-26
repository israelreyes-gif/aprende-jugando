import { shuffle } from '../../../core/random.js';
import { isGenerator, weighted } from '../../../exercises/session.js';

/**
 * Reparte los ejercicios de un tema de uno en uno, sin repetir hasta agotarlos.
 * Con generadores nunca se acaba (vuelve a empezar); con solo preguntas fijas devuelve null al terminar.
 */
export function itemSupplier(exercises) {
  const endless = exercises.some(isGenerator);
  let queue = shuffle(weighted(exercises));
  return () => {
    if (queue.length === 0 && endless) queue = shuffle(weighted(exercises));
    return queue.shift() ?? null;
  };
}
