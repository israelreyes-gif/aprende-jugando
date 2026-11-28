import { reload } from '../../../core/router.js';
import { addShield } from '../../../data/shields.repo.js';
import { notify } from '../../../shared/modal.js';

/** Gasta un diamante en el día perdido (ayer) y recarga la pantalla. Devuelve true si salvó la racha. */
export async function useDiamond({ profile, alert }) {
  try {
    await addShield(profile.id, alert.day);
  } catch (err) {
    console.error(err);
    await notify({ kind: 'error', title: 'No se pudo usar el diamante', message: 'Revisa la conexión e inténtalo de nuevo.' });
    return false;
  }
  await notify({ kind: 'success', title: '¡Racha salvada!', message: `Tu racha de ${alert.streak} días sigue en pie.` });
  reload();
  return true;
}
