import { HttpError, json, readJson } from './http.js';
import { hashCode, randomHex } from './auth-crypto.js';
import { checkCode, checkLegacyPin, LEGACY } from './auth-check.js';
import { deleteCredential, getCredential, saveCredential } from './auth-credentials.js';
import { PARENT, assertValidCode } from './auth-rules.js';
import { createSession, deleteOwnerSessions, deleteSession, findSession } from './auth-sessions.js';

const fail = (result, cors) => json({ error: result.error, ...(result.retry_in ? { retry_in: result.retry_in } : {}), ...(result.left !== undefined ? { left: result.left } : {}) }, result.status, cors);

async function assertOwner(db, owner) {
  if (owner === PARENT) return;
  const row = typeof owner === 'string' && owner ? await db.prepare('SELECT id FROM profiles WHERE id = ?').bind(owner).first() : null;
  if (!row) throw new HttpError(404, 'Perfil no encontrado');
}

async function setCode(db, owner, code) {
  assertValidCode(code, owner);
  const salt = randomHex(16);
  await saveCredential(db, owner, salt, await hashCode(code, salt));
}

const sessionOf = async (db, request) => findSession(db, request.headers.get('X-Session') || '');

/** Rutas /auth/*. Todas llevan ya la clave de API comprobada; las que cambian cosas piden además sesión. */
export async function handleAuth(request, env, parts, cors) {
  const db = env.DB;
  const [, action] = parts;
  if (parts.length !== 2) throw new HttpError(404, 'Ruta no encontrada');

  if (request.method === 'GET' && action === 'profiles') {
    const { results } = await db.prepare(
      `SELECT p.id, p.name, p.avatar_color, p.gender, p.course_id, p.ask_always, p.created_at,
              EXISTS (SELECT 1 FROM credentials c WHERE c.owner = p.id) AS has_code
       FROM profiles p ORDER BY p.created_at ASC`,
    ).all();
    return json(results.map((r) => ({ ...r, has_code: Boolean(r.has_code) })), 200, cors);
  }
  if (request.method === 'GET' && action === 'parent') {
    const credential = await getCredential(db, PARENT);
    const legacy = await db.prepare("SELECT 1 AS x FROM settings WHERE key = 'parent_pin'").first();
    return json({ has_code: Boolean(credential), legacy: Boolean(legacy) }, 200, cors);
  }
  if (request.method !== 'POST') throw new HttpError(404, 'Ruta no encontrada');

  if (action === 'logout') {
    const session = await sessionOf(db, request);
    if (session) await deleteSession(db, session.hash);
    return json({ ok: true }, 200, cors);
  }

  const body = await readJson(request);
  const owner = body.owner;

  if (action === 'login') {
    await assertOwner(db, owner);
    const result = await checkCode(env, owner, body.code);
    if (!result.ok) return fail(result, cors);
    return json({ token: await createSession(db, owner) }, 200, cors);
  }

  if (action === 'setup') {
    await assertOwner(db, owner);
    if (await getCredential(db, owner)) throw new HttpError(409, 'Ya tiene código');
    if (owner === PARENT) {
      const legacyRow = await db.prepare("SELECT 1 AS x FROM settings WHERE key = 'parent_pin'").first();
      if (legacyRow) {
        const result = await checkLegacyPin(env, body.pin);
        if (!result.ok) return fail(result, cors);
      }
    }
    await setCode(db, owner, body.code);
    if (owner === PARENT) {
      await db.prepare("DELETE FROM settings WHERE key = 'parent_pin'").run();
      await deleteCredential(db, LEGACY);
    }
    return json({ token: await createSession(db, owner) }, 201, cors);
  }

  const session = await sessionOf(db, request);
  if (!session) throw new HttpError(401, 'Sesión no válida');

  if (action === 'change') {
    await assertOwner(db, owner);
    const byParent = session.owner === PARENT && owner !== PARENT;
    if (session.owner !== owner && !byParent) throw new HttpError(403, 'Operación no permitida');
    if (!byParent) {
      const result = await checkCode(env, owner, body.current);
      if (!result.ok) return fail(result, cors);
    }
    await setCode(db, owner, body.code);
    await deleteOwnerSessions(db, owner);
    return json({ token: await createSession(db, owner) }, 200, cors);
  }

  if (action === 'reset') {
    if (session.owner !== PARENT) throw new HttpError(403, 'Operación no permitida');
    await assertOwner(db, owner);
    if (owner === PARENT) throw new HttpError(400, 'El código de padres no se restablece desde la app');
    await deleteCredential(db, owner);
    await deleteOwnerSessions(db, owner);
    return json({ ok: true }, 200, cors);
  }

  throw new HttpError(404, 'Ruta no encontrada');
}
