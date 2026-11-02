import { HttpError } from './http.js';

/**
 * Qué puede hacer la app con cada tabla. Todo lo que no esté aquí se rechaza con 403,
 * aunque la clave de API sea correcta (así una clave filtrada no sirve para vaciar tablas ni cambiar títulos).
 *   read: GET · create: POST · edit: PATCH · remove: DELETE
 */
export const PERMISSIONS = {
  profiles: { read: true, create: true, edit: true, remove: true },
  settings: { read: true, create: true },
  practice_sessions: { read: true, create: true },
  answers: { read: true, create: true },
  study_progress: { read: true, create: true },
  topic_release: { read: true, create: true, remove: true },
  reto_diario: { read: true, create: true, edit: true },
  push_devices: { read: true, create: true, remove: true },
  topic_titles: { read: true },
  sync_events: { read: true, create: true },
};

const ACTION = { GET: 'read', POST: 'create', PATCH: 'edit', DELETE: 'remove' };

/** Lanza 403 si la app no tiene permiso para este método en esta tabla. */
export function assertAllowed(method, tableName) {
  const action = ACTION[method];
  if (!action) return; // otros métodos: los rechaza el propio Worker con 405
  if (!PERMISSIONS[tableName]?.[action]) throw new HttpError(403, 'Operación no permitida');
}

/** Solo las tablas con algún permiso (la ruta GET /api no enseña el resto). */
export const visibleTables = (names) => names.filter((name) => PERMISSIONS[name]);
