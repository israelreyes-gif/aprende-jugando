import { h } from '../../core/dom.js';

/** Fila de colores. colors: [{ name, hex }]. Llama a onChange(hex) al elegir uno. */
export function colorPicker({ colors, value, onChange }) {
  let current = value;

  const buttons = colors.map((c) =>
    h('button', {
      class: 'swatch', type: 'button', style: { '--swatch': c.hex }, 'aria-label': `Color ${c.name}`,
      'aria-pressed': String(c.hex === current),
      onClick: () => {
        current = c.hex;
        buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(colors[i].hex === current)));
        onChange(current);
      },
    }),
  );

  return h('div', { class: 'swatches' }, buttons);
}
