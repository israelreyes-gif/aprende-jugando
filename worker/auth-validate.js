import { HttpError } from './http.js';

// Lo que una sesión de perfil puede guardar de verdad: sesiones de ejercicios y temas estudiados "razonables".
// Evita inflar los puntos con datos inventados. Los padres no pasan por aquí.
export const MAX_QUESTIONS = 40; // la sesión más larga: 36 preguntas (reto y mix); un tema normal, 8
const KINDS = new Set(['practice', 'reto', 'mix']);
const MAX_ID = 120;
const PAST_DAYS = 60; // una escritura guardada sin conexión puede llegar con retraso, pero no de hace meses
const FUTURE_MS = 24 * 60 * 60 * 1000;

const bad = (message) => new HttpError(400, message);

function checkDate(value) {
  const time = Date.parse(value);
  const now = Date.now();
  if (Number.isNaN(time) || time > now + FUTURE_MS || time < now - PAST_DAYS * FUTURE_MS) throw bad('Fecha no válida');
}

function checkText(value, name) {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_ID) throw bad(`${name} no válido`);
}

/** El tema tiene que estar liberado para ese perfil (sin fila = bloqueado): no se estudia ni se practica lo que no existe o está cerrado. */
async function assertReleased(db, owner, row) {
  for (const key of ['course_id', 'subject_id', 'topic_id']) checkText(row[key], key);
  const found = await db.prepare('SELECT 1 AS x FROM topic_release WHERE profile_id = ? AND course_id = ? AND subject_id = ? AND topic_id = ? LIMIT 1')
    .bind(owner, row.course_id, row.subject_id, row.topic_id).first();
  if (!found) throw new HttpError(403, 'Operación no permitida');
}

/** Valida lo que una sesión de perfil quiere crear en estas tablas (lanza 400/403; si no, no hace nada). */
export async function assertPlausible(db, owner, table, rows) {
  if (table.name === 'practice_sessions') {
    for (const row of rows) {
      checkText(row.id, 'id');
      if (row.kind !== undefined && !KINDS.has(row.kind)) throw bad('Tipo de sesión no válido');
      if (!Number.isInteger(row.total) || row.total < 1 || row.total > MAX_QUESTIONS) throw bad('Número de preguntas no válido');
      if (!Number.isInteger(row.correct) || row.correct < 0 || row.correct > row.total) throw bad('Aciertos no válidos');
      checkDate(row.finished_at);
      await assertReleased(db, owner, row);
    }
  } else if (table.name === 'study_progress') {
    for (const row of rows) {
      checkText(row.id, 'id');
      checkDate(row.completed_at);
      await assertReleased(db, owner, row);
    }
  } else if (table.name === 'answers' && rows.length > MAX_QUESTIONS) {
    throw bad('Demasiadas respuestas');
  }
}
