import { choiceQ } from './make/choice.js';
import { numberQ } from './make/number.js';

const isOptions = (x) => x && typeof x === 'object' && !Array.isArray(x);

/**
 * Convierte las filas de un banco fijo en preguntas con id estable (b1, b2, ...).
 * No cambies el orden de las filas ya publicadas: añade las nuevas al final.
 *   ['¿Cuántos lados tiene un pentágono?', 5]                     -> escribir un número
 *   ['Un triángulo con 3 lados iguales es…', 'equilátero', 'isósceles', 'escaleno']  -> elegir (la correcta va primero)
 * Al final de la fila se puede añadir { explain, visual } con la explicación o un dibujo.
 * Si no hay explicación, se muestra «La respuesta es …».
 */
export function bankQuestions(rows, prefix = 'b') {
  return rows.map((row, i) => {
    const last = row[row.length - 1];
    const items = isOptions(last) ? row.slice(0, -1) : row;
    const { explain, ...extra } = isOptions(last) ? last : {};
    const [prompt, right, ...wrongs] = items;
    const id = `${prefix}${i + 1}`;
    return typeof right === 'number'
      ? { id, ...numberQ(prompt, right, explain ?? `La respuesta es ${right}.`, extra) }
      : { id, ...choiceQ(prompt, right, wrongs, explain ?? `La respuesta correcta es «${right}».`, extra) };
  });
}
