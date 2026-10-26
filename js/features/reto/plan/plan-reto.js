import { rnd, shuffle } from '../../../core/random.js';
import { RETO_SIZE } from '../reto-size.js';
import { itemSupplier } from './item-supplier.js';

/**
 * Prepara el reto: qué preguntas saldrán, repartidas por igual entre los temas.
 * topics: [{ subjectId, topicId, exercises }] (solo temas liberados y con ejercicios).
 * Se da una pregunta a cada tema, en orden aleatorio, y se vuelve a empezar hasta llegar a `size`.
 * Con `size` temas o más sale una pregunta de cada tema elegido; con menos, se reparten por igual.
 * Devuelve [{ subjectId, topicId, exerciseId, seed }] mezclado. La semilla permite recrear la misma pregunta.
 */
export function planReto(topics, size = RETO_SIZE) {
  const pool = shuffle(topics).map((topic) => ({ topic, next: itemSupplier(topic.exercises) }));
  const plan = [];
  let gave = true;
  while (plan.length < size && gave) {
    gave = false;
    for (const { topic, next } of pool) {
      if (plan.length >= size) break;
      const item = next();
      if (!item) continue;
      plan.push({ subjectId: topic.subjectId, topicId: topic.topicId, exerciseId: item.id, seed: rnd(1, 2_000_000_000) });
      gave = true;
    }
  }
  return shuffle(plan);
}
