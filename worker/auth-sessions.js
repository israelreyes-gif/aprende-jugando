import { randomHex, sha256Hex } from './auth-crypto.js';
import { SESSION_DAYS } from './auth-rules.js';

const DAY_MS = 24 * 3600 * 1000;
const REFRESH_AFTER_MS = 10 * 60 * 1000; // la renovación no escribe en cada petición

/** Abre una sesión para `owner` y devuelve el identificador (solo se guarda su huella). */
export async function createSession(db, owner, now = Date.now()) {
  const token = randomHex(32);
  const at = new Date(now).toISOString();
  await db.prepare('INSERT INTO sessions (token_hash, owner, created_at, last_used_at) VALUES (?, ?, ?, ?)').bind(await sha256Hex(token), owner, at, at).run();
  return token;
}

/** Busca la sesión de un identificador. La renueva si sigue vigente; si lleva 7 días sin usarse, la borra. */
export async function findSession(db, token, now = Date.now()) {
  if (!token || typeof token !== 'string') return null;
  const hash = await sha256Hex(token);
  const row = await db.prepare('SELECT owner, last_used_at FROM sessions WHERE token_hash = ?').bind(hash).first();
  if (!row) return null;
  const idle = now - Date.parse(row.last_used_at);
  if (idle > SESSION_DAYS * DAY_MS) {
    await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(hash).run();
    return null;
  }
  if (idle > REFRESH_AFTER_MS) await db.prepare('UPDATE sessions SET last_used_at = ? WHERE token_hash = ?').bind(new Date(now).toISOString(), hash).run();
  return { owner: row.owner, hash };
}

export const deleteSession = (db, hash) => db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(hash).run();
export const deleteOwnerSessions = (db, owner) => db.prepare('DELETE FROM sessions WHERE owner = ?').bind(owner).run();

/** Borra las sesiones que llevan más de 7 días sin usarse. */
export async function purgeExpiredSessions(db, now = Date.now()) {
  const limit = new Date(now - SESSION_DAYS * DAY_MS).toISOString();
  return (await db.prepare('DELETE FROM sessions WHERE last_used_at < ?').bind(limit).run())?.meta?.changes ?? 0;
}
