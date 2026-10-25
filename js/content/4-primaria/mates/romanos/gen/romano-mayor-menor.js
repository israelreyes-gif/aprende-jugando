import { rnd, pick } from '../../../../../core/random.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';
import { toRoman } from '../../lib/to-roman.js';

/** Elegir el número romano mayor o menor entre tres. */
export function romanoMayorMenor() {
  const mayor = pick([true, false]);
  const numeros = new Set();
  while (numeros.size < 3) numeros.add(rnd(10, 99));
  const lista = [...numeros];
  const buscado = mayor ? Math.max(...lista) : Math.min(...lista);
  return choiceQ(
    `¿Cuál es el número romano ${mayor ? 'mayor' : 'menor'}?`,
    toRoman(buscado),
    lista.filter((n) => n !== buscado).map(toRoman),
    `${lista.map((n) => `${toRoman(n)} = ${n}`).join(', ')}.`,
  );
}
