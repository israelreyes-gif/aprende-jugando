import { pick, shuffle } from '../../../../../core/random.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';
import { figuras } from '../../lib/figuras.js';
import { figuraSvg } from '../../lib/figura-svg.js';

/** Dibujo de una figura: elegir cómo se llama. */
export function nombreFigura() {
  const f = pick(figuras);
  const otras = shuffle(figuras.filter((x) => x.n !== f.n)).slice(0, 2).map((x) => x.n);
  return choiceQ('¿Cómo se llama esta figura?', f.n, otras, `Es un ${f.n}.`, { visual: figuraSvg(f, true) });
}
