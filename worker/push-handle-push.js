import { HttpError, json, readJson } from './http.js';
import { sendToDevices } from './push-send-to.js';

const MAX_TITLE = 100;
const MAX_BODY = 300;

const text = (value, max, name) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new HttpError(400, `${name} no válido`);
  return value;
};

/** Busca los móviles a los que va el aviso: 'parents' o { profile_id }. */
async function findDevices(db, target) {
  if (target === 'parents') {
    return (await db.prepare("SELECT * FROM push_devices WHERE kind = 'parent'").all()).results;
  }
  if (target && typeof target.profile_id === 'string' && target.profile_id) {
    return (await db.prepare("SELECT * FROM push_devices WHERE kind = 'child' AND profile_id = ?").bind(target.profile_id).all()).results;
  }
  throw new HttpError(400, 'target no válido');
}

/** POST /push/send  { target, title, body, tag?, url? } -> envía el aviso a esos móviles. */
export async function handlePush(request, env, parts, cors) {
  if (request.method !== 'POST' || parts[1] !== 'send' || parts.length !== 2) throw new HttpError(404, 'Ruta no encontrada');
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) throw new HttpError(500, 'Faltan las claves VAPID en el Worker');

  const input = await readJson(request);
  const message = { title: text(input.title, MAX_TITLE, 'title'), body: text(input.body, MAX_BODY, 'body') };
  if (typeof input.tag === 'string') message.tag = input.tag.slice(0, 60);
  if (typeof input.url === 'string') message.url = input.url.slice(0, 200);

  const devices = await findDevices(env.DB, input.target);
  const result = await sendToDevices(env.DB, env, devices, message);
  return json({ ok: true, devices: devices.length, ...result }, 200, cors);
}
