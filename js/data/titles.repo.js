import { api } from '../core/api.js';

const TTL_MS = 30_000;
let cached = null;

/** Clave de un tema en el mapa de títulos. */
export const titleKey = (courseId, subjectId, topicId) => `${courseId}|${subjectId}|${topicId}`;

async function readTitles() {
  const rows = await api.list('topic_titles');
  return new Map(rows.map((row) => [titleKey(row.course_id, row.subject_id, row.topic_id), row.title]));
}

/**
 * Títulos de los temas (tabla topic_titles de D1), como Map. Se reutiliza 30 segundos para no pedirlo en cada pantalla.
 * Si no se puede leer (sin conexión ni copia guardada), devuelve un Map vacío y se vuelve a intentar la próxima vez.
 */
export function topicTitles() {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.promise;
  const promise = readTitles().catch((err) => {
    console.warn('No se pudieron leer los títulos de los temas', err);
    cached = null;
    return new Map();
  });
  cached = { at: Date.now(), promise };
  return promise;
}
