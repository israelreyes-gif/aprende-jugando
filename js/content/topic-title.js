/** Texto de reserva cuando un tema no tiene fila en topic_titles: su id con espacios y mayúscula inicial. */
export const fallbackTitle = (topicId) => String(topicId).replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
