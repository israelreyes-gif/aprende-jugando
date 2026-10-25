import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Comprobar una división: divisor × cociente + resto = dividendo. */
export function comprobarDivision() {
  const divisor = rnd(2, 9);
  const cociente = rnd(10, 99);
  const resto = rnd(0, divisor - 1);
  const dividendo = divisor * cociente + resto;
  return numberQ(
    `Comprueba la división: ${divisor} × ${cociente} + ${resto} = ?`,
    dividendo,
    `Es el dividendo: ${dividendo} : ${divisor} = ${cociente} y resto ${resto}.`,
  );
}
