import { rnd } from '../../../../../core/random.js';
import { ruleQ } from '../../../../../exercises/make/rule.js';

/** Escribir cualquier número que, redondeado a la centena, dé el que pide el enunciado. */
export function numeroQueRedondea() {
  const objetivo = rnd(2, 9) * 100;
  return ruleQ(
    `Escribe un número que, redondeado a la centena, dé ${objetivo}.`,
    [{ label: 'Tu número', kind: 'number' }],
    ([n]) => Number.isInteger(n) && Math.round(n / 100) * 100 === objetivo,
    `por ejemplo ${objetivo + 23} (vale del ${objetivo - 50} al ${objetivo + 49})`,
    `Todos los números de ${objetivo - 50} a ${objetivo + 49} se redondean a ${objetivo}.`,
  );
}
