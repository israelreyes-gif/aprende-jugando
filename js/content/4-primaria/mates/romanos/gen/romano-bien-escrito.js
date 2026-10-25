import { rnd, shuffle } from '../../../../../core/random.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';
import { toRoman } from '../../lib/to-roman.js';

// Escrituras incorrectas típicas: repiten demasiado, repiten V o L, o restan mal.
const MAL_ESCRITOS = ['IIII', 'XXXX', 'VV', 'LL', 'VX', 'IL', 'IC', 'XXXXX', 'VIIII'];

/** Elegir cuál de las opciones es un número romano bien escrito. */
export function romanoBienEscrito() {
  const bien = toRoman(rnd(4, 99));
  const mal = shuffle(MAL_ESCRITOS).slice(0, 2);
  return choiceQ(
    '¿Cuál de estos números romanos está bien escrito?',
    bien,
    mal,
    `${bien} sigue las reglas. ${mal.join(' y ')} no: no se repite una letra más de tres veces, V y L no se repiten y solo se resta con I, X y C.`,
  );
}
