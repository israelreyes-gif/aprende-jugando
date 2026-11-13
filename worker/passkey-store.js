const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const MAX_CHALLENGES = 200;

/** Reto de un solo uso. Se limpian los caducados y se limita cuántos puede haber a la vez. */
export async function saveChallenge(db, challenge, kind, now = Date.now()) {
  await db.prepare('DELETE FROM passkey_challenges WHERE created_at < ?').bind(now - CHALLENGE_TTL_MS).run();
  await db.prepare('DELETE FROM passkey_challenges WHERE challenge IN (SELECT challenge FROM passkey_challenges ORDER BY created_at ASC LIMIT max(0, (SELECT COUNT(*) FROM passkey_challenges) - ?))').bind(MAX_CHALLENGES - 1).run();
  await db.prepare('INSERT INTO passkey_challenges (challenge, kind, created_at) VALUES (?, ?, ?)').bind(challenge, kind, now).run();
}

/** Gasta el reto: devuelve true solo la primera vez y si no ha caducado. */
export async function useChallenge(db, challenge, kind, now = Date.now()) {
  const result = await db.prepare('DELETE FROM passkey_challenges WHERE challenge = ? AND kind = ? AND created_at >= ?').bind(challenge, kind, now - CHALLENGE_TTL_MS).run();
  return (result.meta?.changes ?? 0) === 1;
}

export const listPasskeys = (db) => db.prepare('SELECT id, label, created_at, last_used_at FROM passkeys ORDER BY created_at ASC').all().then((r) => r.results);
export const getPasskey = (db, id) => db.prepare('SELECT id, public_key FROM passkeys WHERE id = ?').bind(id).first();
export const savePasskey = (db, id, publicKey, label) =>
  db.prepare('INSERT OR REPLACE INTO passkeys (id, public_key, label, created_at, last_used_at) VALUES (?, ?, ?, ?, NULL)').bind(id, publicKey, label, new Date().toISOString()).run();
export const touchPasskey = (db, id) => db.prepare('UPDATE passkeys SET last_used_at = ? WHERE id = ?').bind(new Date().toISOString(), id).run();
export const deletePasskey = (db, id) => db.prepare('DELETE FROM passkeys WHERE id = ?').bind(id).run();
