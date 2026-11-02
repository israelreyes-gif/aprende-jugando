import { FAILS_PER_ROUND, lockSeconds } from './auth-lock.js';

export const getCredential = (db, owner) => db.prepare('SELECT * FROM credentials WHERE owner = ?').bind(owner).first();

export const saveCredential = (db, owner, salt, hash) =>
  db.prepare(
    `INSERT INTO credentials (owner, salt, hash, fails, level, locked_until, updated_at) VALUES (?, ?, ?, 0, 0, NULL, ?)
     ON CONFLICT(owner) DO UPDATE SET salt = excluded.salt, hash = excluded.hash, fails = 0, level = 0, locked_until = NULL, updated_at = excluded.updated_at`,
  ).bind(owner, salt, hash, new Date().toISOString()).run();

export const deleteCredential = (db, owner) => db.prepare('DELETE FROM credentials WHERE owner = ?').bind(owner).run();

export const clearFails = (db, owner) => db.prepare('UPDATE credentials SET fails = 0, level = 0, locked_until = NULL WHERE owner = ?').bind(owner).run();

/** Anota un fallo. Devuelve { locked, seconds }: si este fallo llena la ronda, bloquea y dice cuánto. */
export async function registerFail(db, credential, now = Date.now()) {
  const fails = credential.fails + 1;
  if (fails < FAILS_PER_ROUND) {
    await db.prepare('UPDATE credentials SET fails = ? WHERE owner = ?').bind(fails, credential.owner).run();
    return { locked: false, left: FAILS_PER_ROUND - fails };
  }
  const level = credential.level + 1;
  const seconds = lockSeconds(level);
  await db.prepare('UPDATE credentials SET fails = 0, level = ?, locked_until = ? WHERE owner = ?')
    .bind(level, new Date(now + seconds * 1000).toISOString(), credential.owner).run();
  return { locked: true, seconds };
}
