import { h } from '../../core/dom.js';
import { GENDERS } from '../../data/profile-options.js';

/** Dos tarjetas grandes: chico o chica. Llama a onChange(value) al elegir. */
export function genderPicker({ value, onChange }) {
  let current = value || null;

  const buttons = GENDERS.map((g) =>
    h(
      'button',
      {
        class: 'gender', type: 'button', 'aria-pressed': String(g.value === current),
        onClick: () => {
          current = g.value;
          buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(GENDERS[i].value === current)));
          onChange(current);
        },
      },
      h('span', { class: 'gender__emoji', 'aria-hidden': 'true' }, g.emoji),
      g.label,
    ),
  );

  return h('div', { class: 'gender-row' }, buttons);
}
