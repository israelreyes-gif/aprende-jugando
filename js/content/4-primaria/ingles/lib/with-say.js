import { withSayText } from './say-text.js';

/** Añade el botón 🔊 a los ejercicios: `ruleById` dice, para cada id, qué parte de la pregunta se escucha. */
export function withSay(items, ruleById) {
  return items.map((item) => ({ ...item, generate: () => withSayText(item.generate(), ruleById[item.id]) }));
}
