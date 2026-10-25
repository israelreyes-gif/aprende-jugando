import { rnd } from '../../../../../core/random.js';
import { multiQ } from '../../../../../exercises/make/multi.js';

/** Repartir cartas entre jugadores: cuántas toca a cada uno y cuántas sobran. */
export function repartirCartas() {
  const jugadores = rnd(3, 9);
  const cartas = rnd(20, 99);
  const cada = Math.floor(cartas / jugadores);
  const sobran = cartas % jugadores;
  return multiQ(
    `Repartimos ${cartas} cartas entre ${jugadores} jugadores.`,
    [
      { label: '¿Cuántas cartas toca a cada uno?', answer: cada },
      { label: '¿Cuántas sobran?', answer: sobran },
    ],
    `${cartas} : ${jugadores} = ${cada} y sobran ${sobran}.`,
  );
}
