import { sendToDevices } from './push-send-to.js';
import { telegramConfigured } from './telegram-send.js';
import { escapeHtml } from './telegram-html.js';

const MAX_BODY = 300;

/** Aviso a los padres: título corto y, en el cuerpo, dónde falló y por qué. */
export function errorMessage({ where, detail }) {
  const body = `${where} · ${detail}`.slice(0, MAX_BODY);
  return {
    title: 'Error en el servidor',
    body,
    html: `<b>Error en el servidor</b>\n<code>${escapeHtml(where)}</code> · ${escapeHtml(body.slice(`${where} · `.length))}`,
    tag: `error-${where}`.slice(0, 60),
    url: '#/parents',
  };
}

/**
 * Avisa a los móviles de padres de un error del Worker. Nunca lanza: si no se puede avisar
 * (sin claves, sin base de datos…), solo queda en el registro del Worker.
 * El mismo fallo repetido sustituye al aviso anterior (misma `tag`) en vez de apilarse.
 */
export async function alertParents(env, { where, detail }) {
  try {
    const telegram = telegramConfigured(env);
    if (!env.DB || (!telegram && (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT))) return;
    const devices = (await env.DB.prepare("SELECT * FROM push_devices WHERE kind = 'parent'").all()).results;
    if (devices.length === 0 && !telegram) return;
    await sendToDevices(env.DB, env, devices, errorMessage({ where, detail }), { parents: true });
  } catch (err) {
    console.error('No se pudo avisar del error', String(err?.message || err));
  }
}
