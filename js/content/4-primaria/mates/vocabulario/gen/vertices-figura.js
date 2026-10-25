import { pick } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';
import { figuras } from '../../lib/figuras.js';
import { figuraSvg } from '../../lib/figura-svg.js';

/** Dibujo de una figura con vértices: contar los vértices. */
export function verticesFigura() {
  const f = pick(figuras.filter((x) => x.v > 0));
  return numberQ('¿Cuántos vértices tiene esta figura?', f.v, `Un ${f.n} tiene ${f.v} vértices.`, { visual: figuraSvg(f, true) });
}
