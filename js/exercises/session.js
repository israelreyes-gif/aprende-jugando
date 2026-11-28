import { shuffle } from '../core/random.js';

// Lo que puede haber en la lista de ejercicios de un tema:
//   - una pregunta fija: { id, type, prompt, ... }
//   - un generador: { id, generate: () => pregunta, always?: true, weight?: número }  (cada vez crea datos nuevos)
// always: true hace que el generador salga siempre en la sesión.
// weight: cuántas veces cuenta el generador al sortear (por defecto 1); sirve para que salga más a menudo.
export const isGenerator = (item) => typeof item.generate === 'function';

/** Pregunta lista para mostrar: tal cual si es fija, o recién generada con el id del generador. */
export const materialize = (item) => (isGenerator(item) ? { ...item.generate(), id: item.id } : item);

/** Cada elemento tantas veces como pese. */
export const weighted = (items) => items.flatMap((item) => Array(item.weight || 1).fill(item));

/** `count` elementos: sin repetir si son todos fijos. Con generadores, las fijas salen como mucho una vez y se completa con generadores. */
function take(items, count) {
  const generators = weighted(items.filter(isGenerator));
  if (!generators.length) return shuffle(items).slice(0, count);
  const out = shuffle([...items.filter((item) => !isGenerator(item)), ...generators]).slice(0, count);
  while (out.length < count) out.push(...shuffle(generators).slice(0, count - out.length));
  return out;
}

/** Prepara las preguntas de una sesión (por defecto 8), en orden aleatorio. */
export function buildSession(exercises, size = 8) {
  const always = exercises.filter((item) => item.always);
  const rest = exercises.filter((item) => !item.always);
  const picked = [...always, ...take(rest, Math.max(0, size - always.length))];
  return shuffle(picked).map(materialize);
}
