import { stripHtml, telegramHtml } from './telegram-html.js';

const MAX_TEXT = 4000; // Telegram admite hasta 4096

/** Texto del aviso en Telegram: el título y, debajo, el cuerpo. */
export function telegramText(message) {
  return `${message.title}\n${message.body}`.slice(0, MAX_TEXT);
}

/** ¿Están puestos los secretos de Telegram? */
export const telegramConfigured = (env) => Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID);

/**
 * Envía una copia del aviso al grupo de Telegram. Nunca lanza: si faltan los secretos o Telegram falla,
 * solo queda en el registro del Worker y los avisos al móvil siguen su curso.
 */
async function post(env, payload) {
  return fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, ...payload }),
  });
}

export async function sendTelegram(env, message) {
  if (!telegramConfigured(env)) return false;
  try {
    const html = telegramHtml(message);
    // Con formato (negrita). Si el mensaje es demasiado largo o Telegram rechaza el HTML, se envía en texto plano.
    if (html.length <= MAX_TEXT) {
      const response = await post(env, { text: html, parse_mode: 'HTML' });
      if (response.ok) return true;
      console.error('Telegram rechazó el formato', response.status);
    }
    const plain = await post(env, { text: html === message.html ? stripHtml(html).slice(0, MAX_TEXT) : telegramText(message) });
    if (!plain.ok) console.error('Telegram respondió', plain.status);
    return plain.ok;
  } catch (err) {
    console.error('No se pudo avisar por Telegram', String(err?.message || err));
    return false;
  }
}
