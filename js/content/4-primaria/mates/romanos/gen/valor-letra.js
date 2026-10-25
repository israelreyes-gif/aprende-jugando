import { pick } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';

const LETRAS = [['I', 1], ['V', 5], ['X', 10], ['L', 50], ['C', 100]];

/** Cuánto vale una letra romana. */
export function valorLetra() {
  const [letra, valor] = pick(LETRAS);
  return numberQ(`¿Cuánto vale la letra ${letra}?`, valor, `${letra} = ${valor}.`);
}
