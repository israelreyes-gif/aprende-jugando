import { rnd } from '../../../../../core/random.js';
import { multiQ } from '../../../../../exercises/make/multi.js';

/** Dividir y escribir el cociente y el resto. */
export function cocienteYResto() {
  const divisor = rnd(2, 9);
  const dividendo = rnd(30, 999);
  const cociente = Math.floor(dividendo / divisor);
  const resto = dividendo % divisor;
  return multiQ(
    `Calcula ${dividendo} : ${divisor}`,
    [
      { label: 'Cociente', answer: cociente },
      { label: 'Resto', answer: resto },
    ],
    `${divisor} × ${cociente} + ${resto} = ${dividendo}.`,
  );
}
