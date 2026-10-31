const MAX_TEXT = 1000;

/** Texto del aviso en Telegram: el título y, debajo, el cuerpo. */
export function telegramText(message) {
  return `${message.title}\n${message.body}`.slice(0, MAX_TEXT);
}

/**
 * Envía una copia del aviso al grupo de Telegram. Nunca lanza: si faltan los secretos o Telegram falla,
 * solo queda en el registro del Worker y los avisos al móvil siguen su curso.
 */
export async function sendTelegram(env, message) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return false;
  try {
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: telegramText(message) }),
    });
    if (!response.ok) console.error('Telegram respondió', response.status);
    return response.ok;
  } catch (err) {
    console.error('No se pudo avisar por Telegram', String(err?.message || err));
    return false;
  }
}
