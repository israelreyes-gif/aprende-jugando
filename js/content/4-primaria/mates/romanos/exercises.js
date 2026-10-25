import { romanoANumero } from './gen/romano-a-numero.js';
import { numeroARomano } from './gen/numero-a-romano.js';
import { romanoMayorMenor } from './gen/romano-mayor-menor.js';
import { valorLetra } from './gen/valor-letra.js';
import { romanoBienEscrito } from './gen/romano-bien-escrito.js';

// Generadores: cada sesión crea números nuevos. El id se guarda en las estadísticas.
export const exercises = [
  { id: 'romano-a-numero', generate: romanoANumero },
  { id: 'numero-a-romano', generate: numeroARomano },
  { id: 'romano-mayor-menor', generate: romanoMayorMenor },
  { id: 'valor-letra', generate: valorLetra },
  { id: 'romano-bien-escrito', generate: romanoBienEscrito },
];
