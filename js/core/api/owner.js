import { PARENT_OWNER } from './session-store.js';

/** De quién es la pantalla abierta: un perfil (/p/:pid…), los padres (/parents…, /new-profile) o nadie. */
export function routeOwner(hash = typeof location === 'undefined' ? '' : location.hash) {
  const path = hash.replace(/^#/, '') || '/';
  const profile = path.match(/^\/p\/([^/]+)/);
  if (profile) return decodeURIComponent(profile[1]);
  if (path.startsWith('/parents') || path.startsWith('/new-profile')) return PARENT_OWNER;
  return null;
}

/** Perfil al que se refiere una petición (por sus filtros, su cuerpo o la ruta de la tabla). */
export function inferOwner(path, query, body) {
  const [table, id] = path.split('/');
  const where = query?.where || {};
  if (typeof where.profile_id === 'string') return where.profile_id;
  if (table === 'profiles') {
    if (id) return decodeURIComponent(id);
    if (typeof where.id === 'string') return where.id;
  }
  for (const row of Array.isArray(body) ? body : body ? [body] : []) if (typeof row?.profile_id === 'string') return row.profile_id;
  return null;
}
