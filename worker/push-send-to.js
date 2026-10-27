import { sendPush } from './push-send-push.js';

/** Envía el mismo aviso a varios móviles y borra los que ya no existen. Devuelve cuántos se enviaron y cuántos se borraron. */
export async function sendToDevices(db, env, devices, message) {
  const results = await Promise.all(devices.map((device) => sendPush(device, message, env)));
  const gone = devices.filter((_, i) => results[i].gone);
  for (const device of gone) await db.prepare('DELETE FROM push_devices WHERE id = ?').bind(device.id).run();
  return { sent: results.filter((r) => r.ok).length, removed: gone.length, failed: results.filter((r) => !r.ok && !r.gone).length };
}
