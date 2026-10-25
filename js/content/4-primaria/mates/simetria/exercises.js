import { bankQuestions } from '../../../../exercises/bank.js';
import { filas } from './banco.js';
import { ejesFigura } from './gen/ejes-figura.js';

// Banco fijo (preguntas de texto) + generador con dibujos de figuras.
// weight: cuántas veces cuenta el generador al sortear.
export const exercises = [
  ...bankQuestions(filas, 's'),
  { id: 'fig-ejes', weight: 9, generate: ejesFigura },
];
