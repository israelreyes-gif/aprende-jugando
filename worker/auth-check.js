import { hashCode, sha256Hex } from './auth-crypto.js';
import { clearFails, getCredential, registerFail } from './auth-credentials.js';
import { remainingLock } from './auth-lock.js';
import { alertParents } from './error-alert.js';
import { PARENT } from './auth-rules.js';
import { safeEqual } from './http.js';

/** Nombre para los avisos: el del perfil, o "Padres". */
async function nameOf(db, owner) {
  if (owner === PARENT) return 'Padres';
  const row = await db.prepare('SELECT name FROM profiles WHERE id = ?').bind(owner).first();
  return row?.name || 'Un perfil';
}

/**
 * Comprueba un código con el bloqueo por fallos. `matches(credential)` dice si el código es el bueno.
 * Devuelve { ok: true } o { ok: false, status, error, retry_in?, left? }.
 */
async function guarded(env, owner, credential, matches, now) {
  const wait = remainingLock(credential.locked_until, now);
  if (wait > 0) return { ok: false, status: 423, error: 'Acceso bloqueado un momento', retry_in: wait };
  if (await matches(credential)) {
    if (credential.fails > 0 || credential.level > 0 || credential.locked_until) await clearFails(env.DB, credential.owner);
    return { ok: true };
  }
  const result = await registerFail(env.DB, credential, now);
  if (result.locked) {
    await alertParents(env, { title: 'Acceso bloqueado', where: await nameOf(env.DB, owner), detail: `5 fallos seguidos · bloqueado ${Math.round(result.seconds / 60)} min` });
    return { ok: false, status: 423, error: 'Acceso bloqueado un momento', retry_in: result.seconds };
  }
  return { ok: false, status: 401, error: 'Código incorrecto', left: result.left };
}

/** Comprueba el código de un perfil o de los padres. */
export async function checkCode(env, owner, code, now = Date.now()) {
  const credential = await getCredential(env.DB, owner);
  if (!credential) return { ok: false, status: 404, error: 'Todavía no tiene código' };
  const given = typeof code === 'string' ? code : '';
  return guarded(env, owner, credential, async (c) => safeEqual(await hashCode(given, c.salt), c.hash), now);
}

const LEGACY = 'legacy-pin';

/** Comprueba el PIN antiguo de la zona de padres ("sal:huella" en settings), con el mismo bloqueo por fallos. */
export async function checkLegacyPin(env, pin, now = Date.now()) {
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'parent_pin'").first();
  if (!row) return { ok: false, status: 404, error: 'No hay PIN antiguo' };
  await env.DB.prepare("INSERT OR IGNORE INTO credentials (owner, salt, hash) VALUES (?, '-', '-')").bind(LEGACY).run();
  const credential = await getCredential(env.DB, LEGACY);
  const [salt, hash] = String(row.value).split(':');
  const given = typeof pin === 'string' ? pin : '';
  const result = await guarded(env, PARENT, credential, async () => safeEqual(await sha256Hex(`${salt}:${given}`), hash || ''), now);
  return result;
}
export { LEGACY };
