import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Estanterías llenas más una incompleta. */
export function estanterias() {
  const caben = rnd(8, 15);
  const llenas = rnd(3, 9);
  const ultima = rnd(1, caben - 1);
  const total = caben * llenas + ultima;
  return numberQ(
    `En cada estantería caben ${caben} libros. Hay ${llenas} estanterías llenas y en la última solo ${ultima} libros. ¿Cuántos libros hay en total?`,
    total,
    `${llenas} × ${caben} = ${caben * llenas} y ${caben * llenas} + ${ultima} = ${total}.`,
  );
}
