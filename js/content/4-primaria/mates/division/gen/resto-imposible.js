import { rnd, shuffle } from '../../../../../core/random.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';

/** Elegir qué resto es imposible para un divisor (el que no es menor que el divisor). */
export function restoImposible() {
  const divisor = rnd(3, 9);
  const posibles = shuffle([...Array(divisor).keys()]).slice(0, 2).map(String);
  const imposible = rnd(divisor, divisor + 3);
  return choiceQ(
    `Al dividir entre ${divisor}, ¿qué resto es imposible?`,
    String(imposible),
    posibles,
    `El resto siempre es menor que el divisor: con ${divisor} solo puede ser de 0 a ${divisor - 1}.`,
  );
}
