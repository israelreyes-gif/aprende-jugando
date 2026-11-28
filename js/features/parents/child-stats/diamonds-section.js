import { h } from '../../../core/dom.js';
import { removeShield } from '../../../data/shields.repo.js';
import { dayText } from '../../../shared/day-text.js';
import { diamondSlots } from '../../../shared/diamond.js';
import { notify } from '../../../shared/modal.js';
import { MAX_SHIELDS, SHIELD_EVERY } from '../../reto/diamonds/shield-balance.js';
import { loadShieldInfo } from '../../reto/diamonds/load-shield-info.js';

/**
 * Sección "Diamantes de racha": cuántos tiene el perfil (ranuras) y qué días ha salvado con ellos.
 * Los padres pueden quitar un uso (el diamante vuelve y ese día cuenta como no hecho). info: lo que devuelve loadShieldInfo().
 */
export function diamondsSection({ profile, info }) {
  const slots = h('span', { class: 'free-days__slots' });
  const count = h('b', { class: 'free-days__count' });
  const lost = h('p', { class: 'free-days__hint' });
  const list = h('div', { class: 'free-days__list' });

  function paint(data) {
    slots.replaceChildren(...diamondSlots({ filled: data.available, max: MAX_SHIELDS, width: 28 }));
    count.textContent = `${data.available} de ${MAX_SHIELDS}`;
    lost.textContent = data.lost ? `${data.lost} ${data.lost === 1 ? 'diamante se perdió' : 'diamantes se perdieron'} por llegar al máximo.` : '';
    lost.hidden = !data.lost;
    list.replaceChildren(
      ...(data.shieldDays.length
        ? data.shieldDays.map((day) =>
            h(
              'div',
              { class: 'free-days__row' },
              h('span', {}, dayText(day)),
              h('button', { class: 'btn btn--outline', type: 'button', 'aria-label': `Quitar el diamante usado el ${dayText(day)}`, onClick: () => remove(day) }, 'Quitar'),
            ),
          )
        : [h('p', { class: 'free-days__empty' }, 'Aún no ha usado ningún diamante.')]),
    );
  }

  async function remove(day) {
    try {
      await removeShield(profile.id, day);
      paint(await loadShieldInfo(profile.id));
    } catch (err) {
      console.error(err);
      notify({ kind: 'error', title: 'No se pudo guardar', message: 'Revisa la conexión e inténtalo de nuevo.' });
    }
  }

  paint(info);
  return h(
    'section',
    { class: 'stack' },
    h('h2', { class: 'title-lg' }, 'Diamantes de racha'),
    h(
      'div',
      { class: 'free-days' },
      h('div', { class: 'free-days__summary' }, slots, count),
      h('p', { class: 'free-days__hint' }, `${profile.name} gana un diamante en las rachas ${SHIELD_EVERY}, ${SHIELD_EVERY * 2} y ${SHIELD_EVERY * 3}, hasta ${MAX_SHIELDS} guardados. Lo usa ella cuando falla un día, y solo salva el día de ayer. Sin diamante, la racha se rompe salvo que marques ese día como libre.`),
      lost,
      list,
      h('p', { class: 'free-days__hint' }, 'Quitar un uso devuelve el diamante y ese día vuelve a contar como no hecho.'),
    ),
  );
}
