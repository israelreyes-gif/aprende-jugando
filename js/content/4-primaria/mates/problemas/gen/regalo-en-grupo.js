import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

/** Multiplicar lo que pone cada persona y restar el precio del regalo. */
export function regaloEnGrupo() {
  const personas = rnd(5, 12);
  const cada = rnd(5, 20);
  const regalo = rnd(10, personas * cada - 10);
  return numberQ(
    `${personas} personas ponen ${cada} € cada una y se compra un regalo de ${regalo} €. ¿Cuántos euros quedan?`,
    personas * cada - regalo,
    `${personas} × ${cada} = ${personas * cada} € y ${personas * cada} − ${regalo} = ${personas * cada - regalo} €.`,
  );
}
