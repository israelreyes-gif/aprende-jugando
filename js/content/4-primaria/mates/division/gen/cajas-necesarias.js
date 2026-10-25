import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Problema con resto: hay que usar una caja más para lo que sobra. */
export function cajasNecesarias() {
  const porCaja = rnd(4, 9);
  const completas = rnd(3, 12);
  const sobran = rnd(1, porCaja - 1);
  const huevos = porCaja * completas + sobran;
  return numberQ(
    `Tenemos ${huevos} huevos y en cada caja caben ${porCaja}. ¿Cuántas cajas hacen falta para guardarlos todos?`,
    completas + 1,
    `${huevos} : ${porCaja} = ${completas} y sobran ${sobran}. Esos ${sobran} también necesitan una caja: ${completas + 1} cajas.`,
  );
}
