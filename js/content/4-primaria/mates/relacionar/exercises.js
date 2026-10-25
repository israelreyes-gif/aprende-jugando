import { porDiez } from './gen/por-diez.js';
import { unoMasOMenos } from './gen/uno-mas-o-menos.js';
import { mitadODoble } from './gen/mitad-o-doble.js';
import { completar } from './gen/completar.js';

// Generadores: cada sesión crea números nuevos. El id se guarda en las estadísticas.
export const exercises = [
  { id: 'por-diez', generate: porDiez },
  { id: 'uno-mas-o-menos', generate: unoMasOMenos },
  { id: 'mitad-o-doble', generate: mitadODoble },
  { id: 'completar', generate: completar },
];
