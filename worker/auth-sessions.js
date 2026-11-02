import { randomHex, sha256Hex } from './auth-crypto.js';
import { PARENT, PARENT_IDLE_MINUTES, SESSION_DAYS } from './auth-rules.js';

const DAY_MS = 24 * 3600 * 1000;
const REFRESH_AFTER_MS = 10 * 60 * 1000; // la renovación no escribe en cada petición
const PARENT_REFRESH_AFTER_MS = 60 * 1000; // la de padres caduca antes, así que se renueva más a menudo
const PARENT_IDLE_MS = PARENT_IDLE_MINUTES * 60 * 1000;

/** Abre una sesión para `owner` y devuelve el identificador (solo se guarda su huella). */
export async function createSession(db, owner, now = Date.now()) {
  const token = randomHex(32);
  const at = new Date(now).toISOString();
  await db.prepare('INSERT INTO sessions (token_hash, owner, created_at, last_used_at) VALUES (?, ?, ?, ?)').bind(await sha256Hex(token), owner, at, at).run();
  return token;
}

/** Busca la sesión de un identificador. La renueva si sigue vigente; si lleva 7 días sin usarse (30 minutos la de padres), la borra. */
export async function findSession(db, token, now = Date.now()) {
  if (!token || typeof token !== 'string') return null;
  const hash = await sha256Hex(token);
  const row = await db.prepare('SELECT owner, last_used_at FROM sessions WHERE token_hash = ?').bind(hash).first();
  if (!row) return null;
  const idle = now - Date.parse(row.last_used_at);
  const parent = row.owner === PARENT;
  if (idle > (parent ? PARENT_IDLE_MS : SESSION_DAYS * DAY_MS)) {
    await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(hash).run();
    return null;
  }
  if (idle > (parent ? PARENT_REFRESH_AFTER_MS : REFRESH_AFTER_MS)) await db.prepare('UPDATE sessions SET last_used_at = ? WHERE token_hash = ?').bind(new Date(now).toISOString(), hash).run();
  return { owner: row.owner, hash };
}

export const deleteSession = (db, hash) => db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(hash).run();
export const deleteOwnerSessions = (db, owner) => db.prepare('DELETE FROM sessions WHERE owner = ?').bind(owner).run();

/** Borra las sesiones caducadas: más de 7 días sin usarse (30 minutos las de padres). */
export async function purgeExpiredSessions(db, now = Date.now()) {
  const limit = new Date(now - SESSION_DAYS * DAY_MS).toISOString();
  const parentLimit = new Date(now - PARENT_IDLE_MS).toISOString();
  const result = await db.prepare('DELETE FROM sessions WHERE (owner != ? AND last_used_at < ?) OR (owner = ? AND last_used_at < ?)').bind(PARENT, limit, PARENT, parentLimit).run();
  return result?.meta?.changes ?? 0;
}
