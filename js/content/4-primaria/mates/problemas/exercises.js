import { gruposDeAlumnos } from './gen/grupos-de-alumnos.js';
import { vueltaDelBillete } from './gen/vuelta-del-billete.js';
import { regaloEnGrupo } from './gen/regalo-en-grupo.js';
import { estanterias } from './gen/estanterias.js';
import { hojasPorClase } from './gen/hojas-por-clase.js';
import { elegirOperacion } from './gen/elegir-operacion.js';
import { autobus } from './gen/autobus.js';

// Generadores: cada sesión crea números nuevos. El id se guarda en las estadísticas.
export const exercises = [
  { id: 'grupos-de-alumnos', generate: gruposDeAlumnos },
  { id: 'vuelta-del-billete', generate: vueltaDelBillete },
  { id: 'regalo-en-grupo', generate: regaloEnGrupo },
  { id: 'estanterias', generate: estanterias },
  { id: 'hojas-por-clase', generate: hojasPorClase },
  { id: 'elegir-operacion', generate: elegirOperacion },
  { id: 'autobus', generate: autobus },
];
