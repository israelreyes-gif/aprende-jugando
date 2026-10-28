/**
 * Estado visual de la tarjeta:
 * locked (sin contenido o sin liberar), done (estudiado, solo en Estudio),
 * red / orange (necesita refuerzo, solo en Ejercicios) u open.
 */
export function cardState(tab, topic, progress) {
  if (!topic.available || !progress.released.has(topic.id)) return 'locked';
  if (tab === 'study') return progress.studied.has(topic.id) ? 'done' : 'open';
  return progress.level.get(topic.id) || 'open';
}
