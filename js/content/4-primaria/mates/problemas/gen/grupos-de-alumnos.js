import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Dos multiplicaciones y una suma. */
export function gruposDeAlumnos() {
  const a = rnd(2, 9);
  const b = rnd(3, 9);
  const c = rnd(2, 9);
  const d = rnd(3, 9);
  return numberQ(
    `Hay ${a} grupos de ${b} alumnos y ${c} grupos de ${d} alumnos. ¿Cuántos alumnos hay en total?`,
    a * b + c * d,
    `${a} × ${b} = ${a * b} y ${c} × ${d} = ${c * d}. Total: ${a * b + c * d}.`,
  );
}
