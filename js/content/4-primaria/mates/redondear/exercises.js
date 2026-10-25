import { redondearCentena } from './gen/redondear-centena.js';
import { redondearMillar } from './gen/redondear-millar.js';
import { estimarSuma } from './gen/estimar-suma.js';
import { numeroQueRedondea } from './gen/numero-que-redondea.js';

// Generadores: cada sesión crea números nuevos. El id se guarda en las estadísticas.
export const exercises = [
  { id: 'centena', generate: redondearCentena },
  { id: 'millar', generate: redondearMillar },
  { id: 'estimar-suma', generate: estimarSuma },
  { id: 'numero-que-redondea', generate: numeroQueRedondea },
];
