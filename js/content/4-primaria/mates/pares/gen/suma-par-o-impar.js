import { rnd } from '../../../../../core/random.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';

/** Decidir si el resultado de una suma es par o impar sin calcularla. */
export function sumaParOImpar() {
  const cuantos = rnd(2, 3);
  const sumandos = Array.from({ length: cuantos }, () => rnd(1, 99));
  const total = sumandos.reduce((a, b) => a + b, 0);
  const par = total % 2 === 0;
  return choiceQ(
    `¿El resultado de ${sumandos.join(' + ')} es par o impar?`,
    par ? 'Par' : 'Impar',
    [par ? 'Impar' : 'Par'],
    `${sumandos.join(' + ')} = ${total}, que es ${par ? 'par' : 'impar'}. Fíjate en cuántos sumandos son impares.`,
  );
}
