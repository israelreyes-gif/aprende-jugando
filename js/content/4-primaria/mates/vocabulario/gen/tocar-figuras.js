import { pick, shuffle } from '../../../../../core/random.js';
import { tapQ } from '../../../../../exercises/make/tap.js';
import { figuras } from '../../lib/figuras.js';
import { figuraSvg } from '../../lib/figura-svg.js';

const CRITERIOS = [
  { prompt: 'Toca todas las figuras que sean cuadriláteros.', cumple: (f) => f.s === 4 },
  { prompt: 'Toca todas las figuras con 5 o más lados.', cumple: (f) => f.s >= 5 },
];

/** 6 figuras con lados rectos: tocar las que cumplen el criterio (siempre entre 1 y 4). */
export function tocarFiguras() {
  const criterio = pick(CRITERIOS);
  const conLados = figuras.filter((f) => f.s > 0);
  let elegidas;
  do {
    elegidas = shuffle(conLados).slice(0, 6);
  } while (![1, 2, 3, 4].includes(elegidas.filter(criterio.cumple).length));
  const buenas = elegidas.filter(criterio.cumple);
  return tapQ(
    criterio.prompt,
    elegidas.map((f) => ({ visual: figuraSvg(f), label: f.n, correct: criterio.cumple(f) })),
    `Son: ${buenas.map((f) => `${f.n} (${f.s} lados)`).join(', ')}.`,
  );
}
