import { addShield } from '../../../data/shields.repo.js';
import { dayText } from '../../../shared/day-text.js';
import { notify } from '../../../shared/modal.js';
import { openModal } from '../../../shared/modal/modal-dialog.js';

/**
 * Deja elegir uno de los días perdidos y gasta un protector en él (ese día pasa a contar como libre).
 * missed: días que se pueden proteger. Devuelve true si se gastó un protector.
 */
export async function useShield({ profile, missed }) {
  const day = await openModal({
    kind: 'info',
    title: '¿Qué día quieres proteger?',
    message: 'Gastas un protector y ese día no rompe tu racha.',
    actions: [...missed.map((d) => ({ label: dayText(d), value: d, style: 'outline' })), { label: 'Cancelar', value: null, style: 'outline' }],
    dismissValue: null,
  });
  if (!day) return false;
  try {
    await addShield(profile.id, day);
  } catch (err) {
    console.error(err);
    await notify({ kind: 'error', title: 'No se pudo usar el protector', message: 'Revisa la conexión e inténtalo de nuevo.' });
    return false;
  }
  await notify({ kind: 'success', title: '¡Racha salvada!', message: `${dayText(day)} ya no rompe tu racha.` });
  return true;
}
