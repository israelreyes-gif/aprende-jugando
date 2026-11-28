import { h } from '../../../core/dom.js';
import { addFreeDay } from '../../../data/free-days.repo.js';
import { listRetoDays } from '../../../data/reto/list-reto-days.js';
import { confirmDialog, notify } from '../../../shared/modal.js';
import { freeDayRange, freeDayText } from './free-day-range.js';
import { missedDays } from './missed-days.js';

/**
 * TEMPORAL (quitar cuando ya no haga falta). Botón que marca como libres todos los días sin reto.
 * current: días libres actuales (Set). onFilled(days): se llama con los días marcados.
 */
export function fillMissedButton({ profile, current, onFilled }) {
  const button = h('button', { class: 'btn btn--outline btn--block', type: 'button' }, 'Marcar como libres los días sin reto');
  const fail = () => notify({ kind: 'error', title: 'No se pudo hacer', message: 'Revisa la conexión e inténtalo de nuevo.' });

  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      const range = freeDayRange();
      const days = missedDays({ doneDays: await listRetoDays(profile.id), freeDays: [...current], today: range.today, min: range.min });
      if (!days.length) return notify({ kind: 'info', title: 'Nada que marcar', message: `${profile.name} no tiene días sin reto en los últimos 30 días.` });
      const ok = await confirmDialog({ title: `Marcar ${days.length} días como libres`, message: days.map(freeDayText).join(', '), confirm: 'Marcarlos' });
      if (!ok) return;
      for (const day of days) await addFreeDay(profile.id, day);
      onFilled(days);
    } catch (err) {
      console.error(err);
      fail();
    } finally {
      button.disabled = false;
    }
  });
  return button;
}
