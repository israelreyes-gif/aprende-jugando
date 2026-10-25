import { pick } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';
import { figuras } from '../../lib/figuras.js';
import { figuraSvg } from '../../lib/figura-svg.js';

/** Dibujo de una figura con lados rectos: contar los lados. */
export function ladosFigura() {
  const f = pick(figuras.filter((x) => x.s > 0));
  return numberQ('¿Cuántos lados tiene esta figura?', f.s, `Un ${f.n} tiene ${f.s} lados.`, { visual: figuraSvg(f, true) });
}
