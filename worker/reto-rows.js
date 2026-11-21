import { HttpError } from './http.js';
import { checkDate, checkDay } from './check-date.js';

// El reto del día lo escribe la app del perfil, y la racha (y sus puntos) cuenta los retos terminados:
// no se aceptan días ni fechas inventados ni textos enormes.
export const MAX_QUESTIONS_JSON = 100_000;
export const MAX_ANSWERS_JSON = 60_000;
const bad = (message) => new HttpError(400, message);
const isText = (value, max) => typeof value === 'string' && value.length >= 1 && value.length <= max;

/** Fila nueva del reto: id, curso, día razonable, fecha de fin (si hay) razonable y textos acotados. */
export function assertRetoRow(row) {
  if (!isText(row.id, 120) || !isText(row.course_id, 120)) throw bad('Reto no válido');
  checkDay(row.day);
  if (row.finished_at != null) checkDate(row.finished_at);
  if (row.questions !== undefined && !(typeof row.questions === 'string' && row.questions.length <= MAX_QUESTIONS_JSON)) throw bad('Preguntas demasiado largas');
  if (row.answers !== undefined) assertRetoPatch({ answers: row.answers });
}

/** Cambios que un perfil puede hacer en su reto: respuestas (texto acotado) y fecha de fin razonable. */
export function assertRetoPatch(body) {
  if (body.answers !== undefined && !(typeof body.answers === 'string' && body.answers.length <= MAX_ANSWERS_JSON)) throw bad('Respuestas demasiado largas');
  if (body.finished_at != null) checkDate(body.finished_at);
}
