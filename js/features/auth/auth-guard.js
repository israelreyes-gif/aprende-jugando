import { PARENT_OWNER, hasSession } from '../../core/api/session-store.js';
import { asksAlways } from '../../data/auth.repo.js';
import { isEditOk, isEntered } from './flags.js';
import { rememberNext } from './next-page.js';

function toLogin(path, owner, edit = false) {
  rememberNext(path);
  return `#/login/${encodeURIComponent(owner)}${edit ? '/edit' : ''}`;
}

/**
 * Antes de abrir una pantalla: ¿hay que pedir el código? Devuelve el '#/login/…' al que ir, o null para seguir.
 * Los padres con sesión abierta entran en todo; un perfil, en lo suyo; editar un perfil pide su código siempre.
 */
export function authGuard(path) {
  if (path === '/' || path === '/setup' || path.startsWith('/login/')) return null;
  const parent = hasSession(PARENT_OWNER);

  if (path.startsWith('/parents') || path === '/new-profile') return parent ? null : toLogin(path, PARENT_OWNER);

  const match = path.match(/^\/p\/([^/]+)(\/.*)?$/);
  if (!match || parent) return null;
  const pid = decodeURIComponent(match[1]);
  const editing = match[2] === '/edit';
  if (!hasSession(pid)) return toLogin(path, pid, editing);
  if (editing && !isEditOk(pid)) return toLogin(path, pid, true);
  if (!editing && asksAlways(pid) && !isEntered(pid)) return toLogin(path, pid);
  return null;
}

/** Cuando el Worker dice que la sesión ya no vale: a pedir el código de ese perfil (o el de padres). */
export function authRedirect(err, path) {
  const owner = err.owner || PARENT_OWNER;
  return toLogin(path, owner, owner !== PARENT_OWNER && path.endsWith('/edit'));
}
