import { HttpError, MAX_BODY_BYTES } from './http.js';
import { PARENT } from './auth-rules.js';
import { assertReplaceAllowed } from './auth-replace.js';
import { assertPlausible } from './auth-validate.js';

const FORBIDDEN = () => new HttpError(403, 'Operación no permitida');

// Qué puede hacer una sesión de perfil (los padres pueden todo lo que permite permissions.js).
// by: columna que ata la fila al perfil · cols: columnas que puede cambiar · kind: tipo de móvil permitido
const PROFILE_RULES = {
  profiles: { read: true, edit: true, by: 'id', cols: ['name', 'avatar_color', 'gender', 'ask_always'] },
  practice_sessions: { read: true, create: true, by: 'profile_id' },
  study_progress: { read: true, create: true, by: 'profile_id' },
  reto_diario: { read: true, create: true, edit: true, by: 'profile_id', cols: ['answers', 'finished_at'] },
  topic_release: { read: true, by: 'profile_id' },
  push_devices: { read: true, create: true, remove: true, by: 'profile_id', kind: 'child' },
  sync_events: { create: true, by: 'profile_id', nullable: true },
  topic_titles: { read: true },
  answers: { create: true, viaSession: true },
};
const ACTION = { GET: 'read', POST: 'create', PATCH: 'edit', DELETE: 'remove' };

async function bodyRows(request) {
  const text = await request.clone().text().catch(() => '');
  if (text.length > MAX_BODY_BYTES) throw new HttpError(413, 'Petición demasiado grande');
  let body = null;
  try { body = JSON.parse(text); } catch { /* cuerpo no válido: sin filas */ }
  return Array.isArray(body) ? body : body ? [body] : [];
}

/**
 * Comprueba que la sesión puede hacer esta operación y ata la petición a su perfil
 * (añade el filtro al `params`). Los padres pasan siempre; un perfil solo toca lo suyo.
 */
export async function enforceScope(db, session, method, table, params, id, request) {
  if (session.owner === PARENT) return;
  const rule = PROFILE_RULES[table.name];
  const action = ACTION[method];
  if (!rule || !action || !rule[action]) throw FORBIDDEN();
  const owner = session.owner;

  if (action === 'create') {
    const rows = await bodyRows(request);
    await assertReplaceAllowed(db, owner, table, params, rows);
    if (rule.viaSession) {
      const ids = [...new Set(rows.map((r) => r.session_id))];
      const found = ids.length
        ? (await db.prepare(`SELECT COUNT(*) AS n FROM practice_sessions WHERE profile_id = ? AND id IN (${ids.map(() => '?').join(',')})`).bind(owner, ...ids).first()).n
        : 0;
      if (rows.length === 0 || found !== ids.length) throw FORBIDDEN();
      await assertPlausible(db, owner, table, rows);
      return;
    }
    for (const row of rows) {
      const mine = row[rule.by] === owner || (rule.nullable && (row[rule.by] === null || row[rule.by] === undefined));
      if (!mine || (rule.kind && row.kind !== rule.kind)) throw FORBIDDEN();
    }
    await assertPlausible(db, owner, table, rows);
    return;
  }

  if (rule.by) {
    if (rule.by === 'id' && id !== undefined && id !== owner) throw FORBIDDEN();
    params.append(rule.by, `eq.${owner}`);
  }
  if (rule.kind) params.append('kind', `eq.${rule.kind}`);
  if (action === 'edit' && rule.cols) {
    const [body] = await bodyRows(request);
    if (!body || Object.keys(body).some((k) => !rule.cols.includes(k))) throw FORBIDDEN();
    if (table.name === 'reto_diario' && String(body.answers ?? '').length > 60_000) throw new HttpError(400, 'Respuestas demasiado largas');
  }
}

/** Qué avisos push puede mandar una sesión de perfil: a los padres o a sus propios móviles. */
export function assertPushTarget(session, target) {
  if (session.owner === PARENT || target === 'parents') return;
  if (target && target.profile_id === session.owner) return;
  throw FORBIDDEN();
}
