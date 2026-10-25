import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Hacer grupos: cuántas bolsas completas salen. */
export function bolsasCompletas() {
  const porBolsa = rnd(3, 9);
  const caramelos = rnd(20, 99);
  const bolsas = Math.floor(caramelos / porBolsa);
  return numberQ(
    `Tenemos ${caramelos} caramelos y ponemos ${porBolsa} en cada bolsa. ¿Cuántas bolsas completas salen?`,
    bolsas,
    `${caramelos} : ${porBolsa} = ${bolsas} y sobran ${caramelos % porBolsa}.`,
  );
}
