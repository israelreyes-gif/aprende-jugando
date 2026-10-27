import { api } from '../core/api.js';

async function fingerprint(text) {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
}

/** Un móvil + un uso (un perfil o los padres) = un id. Activar dos veces no duplica filas. */
async function deviceId({ kind, profileId, endpoint }) {
  return `${kind}-${profileId || 'padres'}-${await fingerprint(endpoint)}`;
}

/** Guarda este móvil para recibir avisos. kind: 'child' (con profileId) o 'parent'. */
export async function registerDevice({ kind, profileId, subscription }) {
  const { endpoint, keys } = subscription.toJSON();
  const row = { id: await deviceId({ kind, profileId, endpoint }), kind, profile_id: profileId || null, endpoint, p256dh: keys.p256dh, auth: keys.auth };
  await api.insert('push_devices', row, { conflict: 'replace' });
}

/** ¿Este móvil ya recibe esos avisos? */
export async function isDeviceRegistered({ kind, profileId, endpoint }) {
  return Boolean(await api.get('push_devices', await deviceId({ kind, profileId, endpoint })));
}

/** Este móvil deja de recibir esos avisos. */
export async function unregisterDevice({ kind, profileId, endpoint }) {
  await api.remove('push_devices', { id: await deviceId({ kind, profileId, endpoint }) });
}
