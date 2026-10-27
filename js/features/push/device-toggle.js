import { registerDevice, unregisterDevice } from '../../data/push-devices.js';
import { sendPush } from '../../data/push-send.js';
import { currentSubscription, subscribeDevice } from './device-subscription.js';

/**
 * Activa los avisos de este móvil (kind: 'child' con profileId, o 'parent') y manda un aviso de bienvenida.
 * Si no hay permiso lanza un Error con code 'denied'. Devuelve { welcomeSent }.
 */
export async function turnOn({ kind, profileId, target, welcome }) {
  const subscription = await subscribeDevice();
  if (!subscription) throw Object.assign(new Error('Permiso denegado'), { code: 'denied' });

  await registerDevice({ kind, profileId, subscription });
  try {
    const result = await sendPush(target, welcome);
    return { welcomeSent: result.sent > 0 };
  } catch (err) {
    console.warn('No se pudo enviar el aviso de bienvenida', err);
    return { welcomeSent: false };
  }
}

/** Este móvil deja de recibir esos avisos (la suscripción del móvil se conserva por si vuelve a activarlos). */
export async function turnOff({ kind, profileId }) {
  const subscription = await currentSubscription();
  if (subscription) await unregisterDevice({ kind, profileId, endpoint: subscription.endpoint });
}
