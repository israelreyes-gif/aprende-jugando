import { HttpError } from './http.js';

// Servicios de avisos push conocidos (el navegador da la dirección de uno de ellos). Coincide el dominio o un subdominio suyo.
const KNOWN_HOSTS = [
  'push.apple.com', // Safari / iPhone (web.push.apple.com)
  'fcm.googleapis.com', // Chrome / Android
  'push.services.mozilla.com', // Firefox
  'notify.windows.com', // Edge / Windows
];
const MAX_LENGTH = 1000;

const extraHosts = (env) => String(env?.PUSH_ALLOWED_HOSTS || '').split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);

/** ¿Es esta dirección de un servicio de avisos conocido? (https, sin usuario ni puerto raro). PUSH_ALLOWED_HOSTS añade dominios exactos (solo para pruebas; en producción no se define). */
export function isPushEndpoint(value, env) {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_LENGTH) return false;
  let url;
  try { url = new URL(value); } catch { return false; }
  if (url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  const matches = (known) => host === known || host.endsWith(`.${known}`);
  // Los servicios reales: solo https y puerto normal. Los dominios de PUSH_ALLOWED_HOSTS (solo pruebas) se aceptan tal cual.
  if (url.protocol === 'https:' && (!url.port || url.port === '443') && KNOWN_HOSTS.some(matches)) return true;
  return extraHosts(env).some((known) => host === known);
}

/** Al guardar un móvil con avisos: la dirección tiene que ser de un servicio conocido. */
export function assertPushEndpoints(rows, env) {
  for (const row of rows) {
    if (row && 'endpoint' in row && !isPushEndpoint(row.endpoint, env)) throw new HttpError(400, 'Dirección de avisos no válida');
  }
}
