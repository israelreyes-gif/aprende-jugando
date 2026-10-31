import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Continuar una tabla: tres números seguidos de la tabla del n, escribir el siguiente. */
export function serie() {
  const n = rnd(2, 10);
  const k = rnd(2, 7);
  return numberQ(
    `Tabla del ${n}: ${n * k}, ${n * (k + 1)}, ${n * (k + 2)}, ?`,
    n * (k + 3),
    `Cada número suma ${n} al anterior: ${n * (k + 2)} + ${n} = ${n * (k + 3)}.`,
  );
}
