import { rnd, pick } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Multiplicar el precio y restarlo de lo que se paga. */
export function vueltaDelBillete() {
  let billete;
  let litros;
  let precio;
  do {
    billete = pick([20, 50, 100]);
    litros = rnd(2, 9);
    precio = rnd(2, 12);
  } while (litros * precio >= billete);
  return numberQ(
    `Vamos al supermercado con un billete de ${billete} € y compramos ${litros} litros de aceite a ${precio} € el litro. ¿Cuántos euros sobran?`,
    billete - litros * precio,
    `${litros} × ${precio} = ${litros * precio} € y ${billete} − ${litros * precio} = ${billete - litros * precio} €.`,
  );
}
