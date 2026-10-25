import { cifrasMayorMenor } from './gen/cifras-mayor-menor.js';
import { palabrasACifras } from './gen/palabras-a-cifras.js';
import { cifrasAPalabras } from './gen/cifras-a-palabras.js';
import { ordenarNumeros } from './gen/ordenar-numeros.js';
import { sinRepetir } from './gen/sin-repetir.js';
import { elegirMayorMenor } from './gen/elegir-mayor-menor.js';

// Generadores: cada sesión crea números nuevos. El id se guarda en las estadísticas.
export const exercises = [
  { id: 'cartas', generate: cifrasMayorMenor },
  { id: 'palabras-a-cifras', generate: palabrasACifras },
  { id: 'cifras-a-palabras', generate: cifrasAPalabras },
  { id: 'ordenar', generate: ordenarNumeros },
  { id: 'sin-repetir', generate: sinRepetir },
  { id: 'mayor-menor', generate: elegirMayorMenor },
];
