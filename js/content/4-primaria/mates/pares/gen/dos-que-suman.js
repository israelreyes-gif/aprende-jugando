import { rnd, pick } from '../../../../../core/random.js';
import { ruleQ } from '../../../../../exercises/make/rule.js';

/** Escribir dos números pares (o impares) que sumen una cantidad dada. */
export function dosQueSuman() {
  const pares = pick([true, false]);
  const total = rnd(10, 100) * 2;
  const resto = pares ? 0 : 1;
  const ejemplo = pares ? [2, total - 2] : [1, total - 1];
  return ruleQ(
    `Escribe dos números ${pares ? 'pares' : 'impares'} que sumen ${total}.`,
    [{ label: 'Primer número', kind: 'number' }, { label: 'Segundo número', kind: 'number' }],
    (n) => n.every((x) => Number.isInteger(x) && x > 0 && x % 2 === resto) && n[0] + n[1] === total,
    `por ejemplo ${ejemplo[0]} y ${ejemplo[1]}`,
    `Vale cualquier pareja ${pares ? 'de pares' : 'de impares'} que sume ${total}.`,
  );
}
