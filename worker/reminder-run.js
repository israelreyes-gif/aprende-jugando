import { finishedRetoDays, listChildDevices, retoCourses } from './reminder-data.js';
import { spainDay } from './reminder-dates.js';
import { reminderMessage } from './reminder-message.js';
import { reminderSlot } from './reminder-slot.js';
import { sendToDevices } from './push-send-to.js';
import { computeStreak } from './reminder-streak.js';

const groupByProfile = (devices) => {
  const groups = new Map();
  for (const device of devices) groups.set(device.profile_id, [...(groups.get(device.profile_id) || []), device]);
  return groups;
};

/** Recordatorio de un perfil. Devuelve 'sent', 'done' (ya hizo el reto) o 'no-topics' (sin temas liberados y estudiados: no hay reto posible). */
async function remindProfile(env, { slot, today, profileId, devices }) {
  const courses = await retoCourses(env.DB, profileId);
  if (courses.length === 0) return 'no-topics';

  const doneDays = await finishedRetoDays(env.DB, profileId);
  if (doneDays.includes(today)) return 'done';

  const message = reminderMessage({
    slot,
    name: devices[0].name,
    streak: computeStreak(doneDays, today),
    url: `#/p/${profileId}/c/${courses[0]}/reto`,
  });
  await sendToDevices(env.DB, env, devices, message);
  return 'sent';
}

/**
 * Lo que hace el cron: a la hora de un recordatorio (08:00 o 18:30 en Madrid) avisa a cada perfil
 * con la campanita activada que aún no ha terminado el reto de hoy. Devuelve un resumen para el registro.
 */
export async function runReminders(env, scheduledTime) {
  const when = new Date(scheduledTime);
  const slot = reminderSlot(when);
  if (!slot) return { slot: null };
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) return { slot, error: 'Faltan las claves VAPID' };

  const today = spainDay(when);
  const summary = { slot, sent: 0, done: 0, 'no-topics': 0, failed: 0 };
  for (const [profileId, devices] of groupByProfile(await listChildDevices(env.DB))) {
    try {
      summary[await remindProfile(env, { slot, today, profileId, devices })] += 1;
    } catch (err) {
      console.error('Recordatorio fallido', profileId, err);
      summary.failed += 1;
    }
  }
  return summary;
}
