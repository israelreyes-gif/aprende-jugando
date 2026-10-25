import { rnd } from '../../../../../core/random.js';
import { fmt } from '../../../../../shared/number-format.js';
import { numberQ } from '../../../../../exercises/make/number.js';
import { cartas } from '../../lib/cartas.js';

/** Con 5 o 6 cartas, escribir el mayor o el menor número posible. */
export function cifrasMayorMenor() {
  const digitos = Array.from({ length: rnd(5, 6) }, () => rnd(1, 9));
  const mayor = Math.random() < 0.5;
  const ordenadas = digitos.slice().sort((a, b) => (mayor ? b - a : a - b));
  const valor = Number(ordenadas.join(''));
  return numberQ(
    `Forma el ${mayor ? 'mayor' : 'menor'} número posible usando cada carta una vez.`,
    valor,
    `Ordena las cifras de ${mayor ? 'mayor a menor' : 'menor a mayor'}: ${fmt(valor)}.`,
    { thousands: true, visual: cartas(digitos) },
  );
}
