import { cocienteYResto } from './gen/cociente-y-resto.js';
import { comprobarDivision } from './gen/comprobar-division.js';
import { restoImposible } from './gen/resto-imposible.js';
import { cajasNecesarias } from './gen/cajas-necesarias.js';

// Generadores: cada sesión crea números nuevos. El id se guarda en las estadísticas.
export const exercises = [
  { id: 'cociente-y-resto', generate: cocienteYResto },
  { id: 'comprobar-division', generate: comprobarDivision },
  { id: 'resto-imposible', generate: restoImposible },
  { id: 'cajas-necesarias', generate: cajasNecesarias },
];
