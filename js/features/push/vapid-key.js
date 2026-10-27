import { VAPID_PUBLIC_KEY } from '../../config.js';

/** Convierte la clave pública (base64url) al formato que pide el navegador para suscribirse. */
export function applicationServerKey() {
  const base64 = VAPID_PUBLIC_KEY.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}
