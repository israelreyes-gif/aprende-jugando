import { FAILS_PER_ROUND, lockSeconds } from './auth-lock.js';

export const getCredential = (db, owner) => db.prepare('SELECT * FROM credentials WHERE owner = ?').bind(owner).first();

export const saveCredential = (db, owner, salt, hash) =>
  db.prepare(
    `INSERT INTO credentials (owner, salt, hash, fails, level, locked_until, updated_at) VALUES (?, ?, ?, 0, 0, NULL, ?)
     ON CONFLICT(owner) DO UPDATE SET salt = excluded.salt, hash = excluded.hash, fails = 0, level = 0, locked_until = NULL, updated_at = excluded.updated_at`,
  ).bind(owner, salt, hash, new Date().toISOString()).run();

export const deleteCredential = (db, owner) => db.prepare('DELETE FROM credentials WHERE owner = ?').bind(owner).run();

export const clearFails = (db, owner) => db.prepare('UPDATE credentials SET fails = 0, level = 0, locked_until = NULL WHERE owner = ?').bind(owner).run();

/**
 * Reserva un intento ANTES de mirar el código, en una sola orden de la base de datos (atómica):
 * así, aunque lleguen muchas peticiones a la vez, solo se miran tantos códigos como intentos quedan.
 * Devuelve { fails, level } o null si está bloqueado o la ronda ya está llena.
 */
export const reserveAttempt = (db, owner, now = Date.now()) =>
  db.prepare(
    `UPDATE credentials SET fails = fails + 1
     WHERE owner = ? AND fails < ? AND (locked_until IS NULL OR locked_until <= ?)
     RETURNING fails, level`,
  ).bind(owner, FAILS_PER_ROUND, new Date(now).toISOString()).first();

/** Cierra un intento fallido: si era el último de la ronda, bloquea y dice cuánto ({ locked, seconds }); si no, cuántos quedan. */
export async function settleFail(db, owner, reserved, now = Date.now()) {
  if (reserved.fails < FAILS_PER_ROUND) return { locked: false, left: FAILS_PER_ROUND - reserved.fails };
  const level = reserved.level + 1;
  const seconds = lockSeconds(level);
  await db.prepare('UPDATE credentials SET fails = 0, level = ?, locked_until = ? WHERE owner = ?')
    .bind(level, new Date(now + seconds * 1000).toISOString(), owner).run();
  return { locked: true, seconds };
}
