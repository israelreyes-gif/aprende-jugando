import { applicationServerKey } from './vapid-key.js';

const registration = () => navigator.serviceWorker.ready;

/** La suscripción de este móvil, o null si aún no se ha activado ningún aviso. */
export async function currentSubscription() {
  return (await registration()).pushManager.getSubscription();
}

/**
 * Pide permiso y suscribe este móvil. Devuelve la suscripción, o null si no se concede el permiso.
 * Hay que llamarla directamente desde un toque del usuario (iPhone no deja pedir permiso de otra forma).
 */
export async function subscribeDevice() {
  if (Notification.permission === 'denied') return null;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const { pushManager } = await registration();
  const existing = await pushManager.getSubscription();
  return existing || pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: applicationServerKey() });
}
