import { rnd } from '../../../../../core/random.js';
import { fmt } from '../../../../../shared/number-format.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';

/** Decidir si un número es par o impar mirando su última cifra. */
export function esParOImpar() {
  const n = rnd(100, 99999);
  const par = n % 2 === 0;
  return choiceQ(
    `¿El número ${fmt(n)} es par o impar?`,
    par ? 'Par' : 'Impar',
    [par ? 'Impar' : 'Par'],
    `Termina en ${n % 10}, así que es ${par ? 'par' : 'impar'}.`,
  );
}
