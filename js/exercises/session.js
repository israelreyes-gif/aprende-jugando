import { shuffle } from '../core/random.js';

// Lo que puede haber en la lista de ejercicios de un tema:
//   - una pregunta fija: { id, type, prompt, ... }
//   - un generador: { id, generate: () => pregunta, always?: true }  (cada vez crea datos nuevos)
// always: true hace que el generador salga siempre en la sesión.
const isGenerator = (item) => typeof item.generate === 'function';

/** Pregunta lista para mostrar: tal cual si es fija, o recién generada con el id del generador. */
const materialize = (item) => (isGenerator(item) ? { ...item.generate(), id: item.id } : item);

/** `count` elementos: sin repetir si son todos fijos; recorriendo la lista las veces necesarias si hay generadores. */
function take(items, count) {
  if (!items.some(isGenerator)) return shuffle(items).slice(0, count);
  const out = [];
  while (items.length && out.length < count) out.push(...shuffle(items));
  return out.slice(0, count);
}

/** Prepara las preguntas de una sesión (por defecto 8), en orden aleatorio. */
export function buildSession(exercises, size = 8) {
  const always = exercises.filter((item) => item.always);
  const rest = exercises.filter((item) => !item.always);
  const picked = [...always, ...take(rest, Math.max(0, size - always.length))];
  return shuffle(picked).map(materialize);
}
