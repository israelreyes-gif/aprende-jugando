import { rnd, shuffle } from '../../../../../core/random.js';
import { fmt } from '../../../../../shared/number-format.js';
import { wordsQ } from '../../../../../exercises/make/words.js';
import { palabras } from '../../lib/palabras.js';

const DISTRACTORES = ['quince', 'sesenta', 'trescientos', 'diez', 'noventa', 'cuarenta', 'doce', 'ochocientos'];

/** Número con cifras: construirlo con palabras tocando las fichas en orden. */
export function cifrasAPalabras() {
  const n = rnd(1, 999) * 1000 + (Math.random() < 0.3 ? 0 : rnd(1, 999));
  const fichas = palabras(n).split(' ');
  const extra = shuffle(DISTRACTORES.filter((w) => !fichas.includes(w))).slice(0, 3);
  return wordsQ(
    `Escribe con palabras: ${fmt(n)}. Toca las palabras en orden.`,
    fichas,
    extra,
    `Separa de tres en tres: ${fmt(n)} se lee «${fichas.join(' ')}».`,
  );
}
