import { sendToDevices } from './push-send-to.js';
import { telegramConfigured } from './telegram-send.js';
import { escapeHtml } from './telegram-html.js';
import { claimAlert } from './alert-cooldown.js';

const MAX_BODY = 300;

/** Aviso a los padres: título corto y, en el cuerpo, dónde falló y por qué. */
export function errorMessage({ where, detail, title = 'Error en el servidor', skipped = 0 }) {
  const more = skipped > 0 ? ` (y ${skipped} más desde el último aviso)` : '';
  const body = `${where} · ${detail}${more}`.slice(0, MAX_BODY);
  return {
    title,
    body,
    html: `<b>${escapeHtml(title)}</b>\n<code>${escapeHtml(where)}</code> · ${escapeHtml(body.slice(`${where} · `.length))}`,
    tag: `error-${where}`.slice(0, 60),
    url: '#/parents',
  };
}

/**
 * Avisa a los móviles de padres de un error del Worker. Nunca lanza: si no se puede avisar
 * (sin claves, sin base de datos…), solo queda en el registro del Worker.
 * El mismo fallo (misma `tag`) avisa como mucho una vez cada 15 minutos (alert-cooldown.js); el aviso
 * siguiente cuenta cuántos se callaron. En el móvil, además, un aviso sustituye al anterior de su `tag`.
 */
export async function alertParents(env, { where, detail, title }) {
  try {
    const telegram = telegramConfigured(env);
    if (!env.DB || (!telegram && (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT))) return;
    const devices = (await env.DB.prepare("SELECT * FROM push_devices WHERE kind = 'parent'").all()).results;
    if (devices.length === 0 && !telegram) return;
    const message = errorMessage({ where, detail, title });
    const { send, skipped } = await claimAlert(env.DB, message.tag);
    if (!send) return;
    await sendToDevices(env.DB, env, devices, skipped ? errorMessage({ where, detail, title, skipped }) : message, { parents: true });
  } catch (err) {
    console.error('No se pudo avisar del error', String(err?.message || err));
  }
}
