import { sendPush } from './push-send-push.js';
import { sendTelegram, telegramConfigured } from './telegram-send.js';

async function pushAndClean(db, env, devices, message) {
  const results = await Promise.all(devices.map((device) => sendPush(device, message, env)));
  const gone = devices.filter((_, i) => results[i].gone);
  for (const device of gone) await db.prepare('DELETE FROM push_devices WHERE id = ?').bind(device.id).run();
  return { sent: results.filter((r) => r.ok).length, removed: gone.length, failed: results.filter((r) => !r.ok && !r.gone).length };
}

/**
 * Envía un aviso. A los móviles de los niños, push y una copia al grupo de Telegram.
 * Si va a los padres (parents: true) y Telegram está configurado, va solo a Telegram; si Telegram falla, cae al push.
 * Borra los móviles que ya no existen. Devuelve cuántos se enviaron, cuántos se borraron y cuántos fallaron.
 */
export async function sendToDevices(db, env, devices, message, { parents = false } = {}) {
  if (parents && telegramConfigured(env)) {
    if (await sendTelegram(env, message)) return { sent: 1, removed: 0, failed: 0, via: 'telegram' };
    return pushAndClean(db, env, devices, message);
  }
  const [result] = await Promise.all([pushAndClean(db, env, devices, message), sendTelegram(env, message)]);
  return result;
}
