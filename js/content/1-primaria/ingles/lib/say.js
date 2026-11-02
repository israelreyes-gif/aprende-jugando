/** Añade el botón 🔊 a una pregunta: `text` es lo que se escucha (siempre en inglés). */
export const say = (question, text) => ({ ...question, say: String(text).replace(/\s+/g, ' ').trim() });
