import { h } from '../../../core/dom.js';
import { removeShield } from '../../../data/shields.repo.js';
import { dayText } from '../../../shared/day-text.js';
import { notify } from '../../../shared/modal.js';
import { MAX_SHIELDS, SHIELD_EVERY } from '../../reto/shield/shield-balance.js';
import { loadShieldInfo } from '../../reto/shield/load-shield-info.js';

/**
 * Sección "Protectores de racha": cuántos tiene el perfil y qué días ha salvado con ellos.
 * Los padres pueden quitar uno (ese día vuelve a contar como no hecho). info: lo que devuelve loadShieldInfo().
 */
export function shieldsSection({ profile, info }) {
  const summary = h('p', { class: 'free-days__hint' });
  const list = h('div', { class: 'free-days__list' });

  function paint(data) {
    const word = data.available === 1 ? 'protector' : 'protectores';
    const lost = data.lost ? ` ${data.lost} ${data.lost === 1 ? 'se perdió' : 'se perdieron'} por llegar al máximo.` : '';
    summary.textContent = `${profile.name} tiene ${data.available} ${word} (máximo ${MAX_SHIELDS} guardados). Ha usado ${data.used}.${lost} Se gana uno cada ${SHIELD_EVERY} días de racha y sirve para salvar un día perdido de los últimos 7.`;
    list.replaceChildren(
      ...(data.shieldDays.length
        ? data.shieldDays.map((day) =>
            h(
              'div',
              { class: 'free-days__row' },
              h('span', {}, dayText(day)),
              h('button', { class: 'btn btn--outline', type: 'button', 'aria-label': `Quitar el protector de ${dayText(day)}`, onClick: () => remove(day) }, 'Quitar'),
            ),
          )
        : [h('p', { class: 'free-days__empty' }, 'Aún no ha usado ningún protector.')]),
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
  return h('section', { class: 'stack' }, h('h2', { class: 'title-lg' }, 'Protectores de racha'), h('div', { class: 'free-days' }, summary, list));
}
