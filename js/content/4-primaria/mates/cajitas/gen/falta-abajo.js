import { rnd } from '../../../../../core/random.js';
import { numberQ } from '../../../../../exercises/make/number.js';
import { cajita } from '../../lib/cajita.js';

/** Cajita con un factor oculto: ¿qué número falta abajo? */
export function faltaAbajo() {
  const a = rnd(2, 9);
  const b = rnd(2, 9);
  const izquierda = Math.random() < 0.5;
  return numberQ('¿Qué número falta abajo?', b, `${a * b} : ${a} = ${b}.`, {
    visual: cajita(a * b, izquierda ? a : '?', izquierda ? '?' : a),
  });
}
