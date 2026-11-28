import { h } from '../../../core/dom.js';
import { addFreeDay, removeFreeDay } from '../../../data/free-days.repo.js';
import { notify } from '../../../shared/modal.js';
import { freeDayRange, freeDayText, isValidFreeDay } from './free-day-range.js';

const saveError = () => notify({ kind: 'error', title: 'No se pudo guardar', message: 'Revisa la conexión e inténtalo de nuevo.' });

/**
 * Sección "Días libres" de la zona de padres: días en que el reto no se exige (examen, viaje, enfermedad).
 * No suman a la racha ni la rompen, y no gastan el día de cortesía de la semana.
 * days: días libres actuales ('AAAA-MM-DD'). Se repinta sola al añadir o quitar.
 */
export function freeDaysSection({ profile, days }) {
  const range = freeDayRange();
  const current = new Set(days.filter((day) => day >= range.min));
  const list = h('div', { class: 'free-days__list' });
  const input = h('input', { class: 'input', type: 'date', value: range.today, min: range.min, max: range.max, 'aria-label': 'Día libre' });
  const add = h('button', { class: 'btn btn--outline btn--block', type: 'button' }, 'Añadir día libre');

  function paint() {
    const sorted = [...current].sort().reverse();
    list.replaceChildren(
      ...(sorted.length
        ? sorted.map((day) =>
            h(
              'div',
              { class: 'free-days__row' },
              h('span', {}, freeDayText(day)),
              h('button', { class: 'btn btn--outline', type: 'button', 'aria-label': `Quitar ${freeDayText(day)}`, onClick: () => remove(day) }, 'Quitar'),
            ),
          )
        : [h('p', { class: 'free-days__empty' }, 'No hay días libres marcados.')]),
    );
  }

  async function remove(day) {
    try {
      await removeFreeDay(profile.id, day);
      current.delete(day);
      paint();
    } catch (err) {
      console.error(err);
      saveError();
    }
  }

  add.addEventListener('click', async () => {
    const day = input.value;
    if (!isValidFreeDay(day, range)) {
      notify({ kind: 'error', title: 'Fecha no válida', message: 'Elige un día entre los últimos 30 días y los próximos 60.' });
      return;
    }
    if (current.has(day)) return;
    add.disabled = true;
    try {
      await addFreeDay(profile.id, day);
      current.add(day);
      paint();
    } catch (err) {
      console.error(err);
      saveError();
    } finally {
      add.disabled = false;
    }
  });

  paint();
  return h(
    'section',
    { class: 'stack' },
    h('h2', { class: 'title-lg' }, 'Días libres'),
    h(
      'div',
      { class: 'free-days' },
      h('p', { class: 'free-days__hint' }, `Un día libre no suma a la racha de ${profile.name} ni la rompe. Útil para exámenes, viajes o enfermedad.`),
      h('div', { class: 'free-days__form' }, input, add),
      list,
    ),
  );
}
