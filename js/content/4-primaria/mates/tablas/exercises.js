import { producto } from './gen/producto.js';
import { factorQueFalta } from './gen/factor-que-falta.js';
import { tablero } from './gen/tablero.js';
import { serie } from './gen/serie.js';

// Generadores: cada sesión crea números nuevos. El id se guarda en las estadísticas.
export const exercises = [
  { id: 'producto', generate: producto },
  { id: 'factor-que-falta', generate: factorQueFalta },
  { id: 'tablero', generate: tablero },
  { id: 'serie', generate: serie },
];
