import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Calcular los asientos con una multiplicación y restar los ocupados. */
export function autobus() {
  const filas = rnd(4, 12);
  const porFila = rnd(4, 10);
  const sentadas = rnd(5, 11);
  const asientos = filas * porFila;
  return numberQ(
    `Un autobús tiene ${filas} filas de ${porFila} asientos. Ya van sentadas ${sentadas} personas. ¿Cuántos asientos quedan libres?`,
    asientos - sentadas,
    `${filas} × ${porFila} = ${asientos} y ${asientos} − ${sentadas} = ${asientos - sentadas}.`,
  );
}
