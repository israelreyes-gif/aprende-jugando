import { shuffle } from '../../../../core/random.js';

/**
 * `n` opciones incorrectas distintas de la correcta. Se descarta la que contenga a la correcta o al revés
 * (por ejemplo "nieto" y "nieto/nieta"), para que nunca haya dos respuestas válidas.
 * pool: lista de textos.
 */
export function wrongs(pool, right, n = 3) {
  const out = [];
  for (const item of shuffle([...new Set(pool)])) {
    if (item === right || item.includes(right) || right.includes(item)) continue;
    out.push(item);
    if (out.length === n) break;
  }
  return out;
}
