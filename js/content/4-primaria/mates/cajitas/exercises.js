import { faltaAbajo } from './gen/falta-abajo.js';
import { cuatroOperaciones } from './gen/cuatro-operaciones.js';
import { divisionInversa } from './gen/division-inversa.js';
import { faltaArriba } from './gen/falta-arriba.js';

// Generadores: cada sesión crea números nuevos. El id se guarda en las estadísticas.
export const exercises = [
  { id: 'falta-abajo', generate: faltaAbajo },
  { id: 'cuatro-operaciones', generate: cuatroOperaciones },
  { id: 'division-inversa', generate: divisionInversa },
  { id: 'falta-arriba', generate: faltaArriba },
];
