import { rnd } from '../../../../../core/random.js';
import { multiQ } from '../../../../../exercises/make/multi.js';

/** Multiplicación guiada: calcular cada trozo y después el total. */
export function descomposicionGuiada() {
  const t = rnd(1, 9) * 10;
  const u = rnd(1, 9);
  const m = rnd(2, 9);
  return multiQ(
    `Calcula ${t + u} × ${m} descomponiendo ${t + u} = ${t} + ${u}.`,
    [
      { label: `${t} × ${m} =`, answer: t * m },
      { label: `${u} × ${m} =`, answer: u * m },
      { label: `Total ${t + u} × ${m} =`, answer: (t + u) * m },
    ],
    `${t * m} + ${u * m} = ${(t + u) * m}.`,
  );
}
