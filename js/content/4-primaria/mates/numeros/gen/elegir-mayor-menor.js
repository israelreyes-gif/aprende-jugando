import { rnd } from '../../../../../core/random.js';
import { fmt } from '../../../../../shared/number-format.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';

/** Tres números de 5 o 6 cifras: elegir el mayor o el menor. */
export function elegirMayorMenor() {
  const mayor = Math.random() < 0.5;
  const cifras = rnd(5, 6);
  const numeros = new Set();
  while (numeros.size < 3) numeros.add(rnd(10 ** (cifras - 1), 10 ** cifras - 1));
  const lista = [...numeros];
  const buscado = mayor ? Math.max(...lista) : Math.min(...lista);
  return choiceQ(
    `¿Cuál es el número ${mayor ? 'mayor' : 'menor'}?`,
    fmt(buscado),
    lista.filter((x) => x !== buscado).map(fmt),
    'Compara de izquierda a derecha la primera cifra distinta.',
  );
}
