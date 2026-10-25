import { rnd } from '../../../../../core/random.js';
import { multiQ } from '../../../../../exercises/make/multi.js';

/** Paquetes de 100 hojas repartidos entre clases: cuántas toca y cuántas sobran. */
export function hojasPorClase() {
  const paquetes = rnd(2, 5);
  const clases = rnd(3, 9);
  const hojas = paquetes * 100;
  return multiQ(
    `Tenemos ${paquetes} paquetes de 100 hojas y las repartimos por igual entre ${clases} clases.`,
    [
      { label: '¿Cuántas hojas recibe cada clase?', answer: Math.floor(hojas / clases) },
      { label: '¿Cuántas sobran?', answer: hojas % clases },
    ],
    `${hojas} : ${clases} = ${Math.floor(hojas / clases)} y sobran ${hojas % clases}.`,
  );
}
