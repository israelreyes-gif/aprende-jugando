import { h } from '../../core/dom.js';
import { levelFor } from '../points/levels.js';

/** Etiqueta con el nivel de un perfil (por ejemplo, "🧭 Aventurero"). Sin puntos, no se muestra. */
export function profileLevelChip(points, gender) {
  if (!points) return null;
  const level = levelFor(points.total, gender);
  return h('span', { class: 'level-chip', title: `Nivel ${level.n}` }, `${level.emoji} ${level.name}`);
}
