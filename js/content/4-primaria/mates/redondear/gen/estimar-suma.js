import { rnd } from '../../../../../core/random.js';
import { fmt } from '../../../../../shared/number-format.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';

const aCentena = (n) => Math.round(n / 100) * 100;

/** Elegir el resultado de una suma sin hacer la cuenta exacta (redondeando). */
export function estimarSuma() {
  const a = rnd(120, 890);
  const b = rnd(120, 890);
  const exacto = a + b;
  return choiceQ(
    `Sin hacer la cuenta exacta, ¿cuánto es ${a} + ${b}?`,
    fmt(exacto),
    [fmt(exacto + rnd(90, 140)), fmt(exacto - rnd(90, 140))],
    `Redondea: ${aCentena(a)} + ${aCentena(b)} = ${aCentena(a) + aCentena(b)}. La opción más cercana es ${fmt(exacto)}.`,
  );
}
