import { pick } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';
import { figuras } from '../../lib/figuras.js';
import { figuraSvg } from '../../lib/figura-svg.js';

/** Dibujo de una figura: contar sus ejes de simetría. */
export function ejesFigura() {
  const f = pick(figuras);
  return numberQ('¿Cuántos ejes de simetría tiene esta figura?', f.e, `En el ${f.n} (como el dibujado) hay ${f.e}.`, {
    visual: figuraSvg(f, true),
  });
}
