// Formato de los mensajes de Telegram (parse_mode HTML). Telegram admite negrita, cursiva y código, pero no colores.
export const escapeHtml = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Lo que va en negrita dentro del cuerpo de un aviso: la nota, los días de racha y los puntos de un nivel.
const BOLD_IN_BODY = [/\d+ de \d+ \(\d+ %\)/g, /\d+ días? seguidos?/g, /(?<=^Nivel \d+ · )[\d.]+ puntos/g];

function boldBody(body) {
  return BOLD_IN_BODY.reduce((text, pattern) => text.replace(pattern, '<b>$&</b>'), escapeHtml(body));
}

/** HTML del aviso: el título en negrita y, debajo, el cuerpo con lo importante en negrita. Si trae `html` propio, se usa ese. */
export function telegramHtml(message) {
  if (message.html) return message.html;
  return `<b>${escapeHtml(message.title)}</b>\n${boldBody(String(message.body))}`;
}

/** El mismo texto sin etiquetas (por si Telegram rechaza el HTML). */
export function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}
