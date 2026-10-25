import { decenasYUnidades } from './gen/decenas-y-unidades.js';
import { descomposicionGuiada } from './gen/descomposicion-guiada.js';
import { tresCifras } from './gen/tres-cifras.js';
import { elegirDescomposicion } from './gen/elegir-descomposicion.js';

// Generadores: cada sesión crea números nuevos. El id se guarda en las estadísticas.
export const exercises = [
  { id: 'decenas-y-unidades', generate: decenasYUnidades },
  { id: 'guiada', generate: descomposicionGuiada },
  { id: 'tres-cifras', generate: tresCifras },
  { id: 'elegir', generate: elegirDescomposicion },
];
