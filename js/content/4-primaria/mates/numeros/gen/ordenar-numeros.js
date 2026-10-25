import { rnd } from '../../../../../core/random.js';
import { fmt } from '../../../../../shared/number-format.js';
import { orderQ } from '../../../../../exercises/make/order.js';

/** 3 o 4 números de 5 o 6 cifras: tocarlos de menor a mayor. */
export function ordenarNumeros() {
  const cifras = rnd(5, 6);
  const cuantos = rnd(3, 4);
  const numeros = new Set();
  while (numeros.size < cuantos) numeros.add(rnd(10 ** (cifras - 1), 10 ** cifras - 1));
  const ordenados = [...numeros].sort((a, b) => a - b).map(fmt);
  return orderQ(
    'Ordena de menor a mayor. Toca los números en orden.',
    ordenados,
    'Compara primero la cifra de más a la izquierda y, si es igual, la siguiente.',
  );
}
