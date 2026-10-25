import { esParOImpar } from './gen/es-par-o-impar.js';
import { sumaParOImpar } from './gen/suma-par-o-impar.js';
import { dosQueSuman } from './gen/dos-que-suman.js';
import { tresSeguidos } from './gen/tres-seguidos.js';
import { siguientePar } from './gen/siguiente-par.js';

// Generadores: cada sesión crea números nuevos. El id se guarda en las estadísticas.
export const exercises = [
  { id: 'es-par-o-impar', generate: esParOImpar },
  { id: 'suma-par-o-impar', generate: sumaParOImpar },
  { id: 'dos-que-suman', generate: dosQueSuman },
  { id: 'tres-seguidos', generate: tresSeguidos },
  { id: 'siguiente-par', generate: siguientePar },
];
