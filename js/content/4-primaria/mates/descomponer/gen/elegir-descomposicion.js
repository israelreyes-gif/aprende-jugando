import { rnd, shuffle } from '../../../../../core/random.js';
import { choiceQ } from '../../../../../exercises/make/choice.js';

/** Elegir la descomposición correcta para multiplicar. */
export function elegirDescomposicion() {
  const a = rnd(11, 99);
  const b = rnd(2, 9);
  const t = Math.floor(a / 10) * 10;
  const u = a % 10;
  const malas = shuffle([`${t} × ${b} + ${u}`, `${t} + ${u} × ${b}`, `${a} + ${b}`]).slice(0, 2);
  return choiceQ(`¿Qué descomposición sirve para ${a} × ${b}?`, `${t} × ${b} + ${u} × ${b}`, malas, `Hay que multiplicar las dos partes por ${b}.`);
}
