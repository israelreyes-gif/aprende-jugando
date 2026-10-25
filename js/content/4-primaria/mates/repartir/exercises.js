import { repartirCartas } from './gen/repartir-cartas.js';
import { bolsasCompletas } from './gen/bolsas-completas.js';
import { repartirOGrupos } from './gen/repartir-o-grupos.js';
import { repartirEuros } from './gen/repartir-euros.js';
import { filasDeSillas } from './gen/filas-de-sillas.js';

// Generadores: cada sesión crea números nuevos. El id se guarda en las estadísticas.
export const exercises = [
  { id: 'repartir-cartas', generate: repartirCartas },
  { id: 'bolsas-completas', generate: bolsasCompletas },
  { id: 'repartir-o-grupos', generate: repartirOGrupos },
  { id: 'repartir-euros', generate: repartirEuros },
  { id: 'filas-de-sillas', generate: filasDeSillas },
];
