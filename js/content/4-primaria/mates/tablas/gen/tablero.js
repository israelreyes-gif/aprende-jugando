import { rnd } from '../../../../../core/random.js';
import { multiQ } from '../../../../../exercises/make/multi.js';
import { tableroMini } from '../../lib/tablero-mini.js';

/** Cuadrado de 4 casillas del tablero: sumar las rojas y sumar las verdes (se diferencian en 1). */
export function tablero() {
  const r = rnd(1, 9);
  const c = rnd(1, 9);
  const casillas = [r * c, r * (c + 1), (r + 1) * c, (r + 1) * (c + 1)];
  const rojas = casillas[0] + casillas[3];
  const verdes = casillas[1] + casillas[2];
  return multiQ(
    'En el tablero hay un cuadrado de 4 casillas. Suma las rojas y suma las verdes.',
    [{ label: 'Suma de las rojas', answer: rojas }, { label: 'Suma de las verdes', answer: verdes }],
    `Rojas: ${casillas[0]} + ${casillas[3]} = ${rojas}. Verdes: ${casillas[1]} + ${casillas[2]} = ${verdes}. Siempre se diferencian en 1.`,
    { visual: tableroMini(casillas) },
  );
}
