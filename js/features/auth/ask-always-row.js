import { h } from '../../core/dom.js';
import { icon } from '../../shared/icons.js';
import { switchButton } from '../../shared/switch-button.js';

/** Fila con el interruptor "Pedir el código siempre al abrir mi tarjeta". El valor se lee con .value() al guardar el perfil. */
export function askAlwaysRow({ initial }) {
  let on = Boolean(initial);
  const toggle = switchButton({ checked: on, label: 'Pedir el código siempre', onChange: async (value) => { on = value; } });
  const row = h(
    'div',
    { class: 'switch-row switch-row--ask' },
    h('span', { class: 'switch-row__icon' }, icon('lock')),
    h('span', { class: 'switch-row__text' }, h('span', { class: 'switch-row__title' }, 'Pedir el código siempre'), h('span', { class: 'switch-row__meta' }, 'Cada vez que se abra esta tarjeta')),
    toggle,
  );
  row.value = () => on;
  return row;
}
