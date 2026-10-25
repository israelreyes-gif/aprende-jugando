import { h } from '../../core/dom.js';
import { AVATAR_COLORS, MAX_NAME_LENGTH } from '../../data/profile-options.js';
import { avatar } from '../../shared/avatar.js';
import { colorPicker } from './color-picker.js';

/**
 * Formulario de nombre y color, para crear o editar un perfil.
 * initial: { name, color } con los valores de partida.
 * onSave({ name, color }) guarda los datos (promesa); si falla, se muestra errorText.
 */
export function profileForm({ initial, submitLabel, errorText, onSave }) {
  let color = initial.color;
  let name = initial.name;

  const preview = h('div', { class: 'stack', style: { alignItems: 'center' } });
  const error = h('p', { class: 'field__error', role: 'alert' });
  const submit = h('button', { class: 'btn btn--primary btn--block', type: 'submit' }, submitLabel);

  const drawPreview = () => preview.replaceChildren(avatar({ name, avatar_color: color }, 'xl'));

  const nameInput = h('input', {
    class: 'input', id: 'profile-name', type: 'text', maxlength: MAX_NAME_LENGTH, autocomplete: 'off',
    placeholder: 'Por ejemplo, Lucía', value: name,
    onInput: (event) => {
      name = event.target.value;
      drawPreview();
    },
  });

  const picker = colorPicker({
    colors: AVATAR_COLORS,
    value: color,
    onChange: (hex) => {
      color = hex;
      drawPreview();
    },
  });

  async function onSubmit(event) {
    event.preventDefault();
    error.textContent = '';
    if (!name.trim()) {
      error.textContent = 'Escribe un nombre para el perfil.';
      nameInput.focus();
      return;
    }
    submit.disabled = true;
    try {
      await onSave({ name, color });
    } catch (err) {
      console.error(err);
      error.textContent = errorText;
      submit.disabled = false;
    }
  }

  drawPreview();

  return h(
    'form',
    { class: 'stack', style: { '--gap': '24px' }, onSubmit },
    preview,
    h('div', { class: 'field' }, h('label', { class: 'field__label', for: 'profile-name' }, 'Nombre'), nameInput),
    h('div', { class: 'field' }, h('span', { class: 'field__label' }, 'Color del icono'), picker),
    error,
    submit,
  );
}
