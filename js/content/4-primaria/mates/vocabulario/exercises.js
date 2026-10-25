import { bankQuestions } from '../../../../exercises/bank.js';
import { filas } from './banco.js';
import { nombreFigura } from './gen/nombre-figura.js';
import { ladosFigura } from './gen/lados-figura.js';
import { verticesFigura } from './gen/vertices-figura.js';
import { tocarFiguras } from './gen/tocar-figuras.js';

// Banco fijo (preguntas de texto) + generadores con dibujos de figuras.
// weight: cuántas veces cuenta el generador al sortear. always: sale siempre en la sesión.
export const exercises = [
  ...bankQuestions(filas, 'v'),
  { id: 'fig-nombre', weight: 9, generate: nombreFigura },
  { id: 'fig-lados', weight: 8, generate: ladosFigura },
  { id: 'fig-vertices', weight: 8, generate: verticesFigura },
  { id: 'tocar', always: true, generate: tocarFiguras },
];
