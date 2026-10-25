import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Hacer grupos con una división exacta: cuántas filas de sillas salen. */
export function filasDeSillas() {
  const porFila = rnd(3, 9);
  const filas = rnd(10, 60);
  return numberQ(
    `Hay ${porFila * filas} sillas y se ponen ${porFila} en cada fila. ¿Cuántas filas hay?`,
    filas,
    `${porFila * filas} : ${porFila} = ${filas}.`,
  );
}
