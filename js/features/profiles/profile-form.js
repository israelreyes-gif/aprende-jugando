import { h } from '../../core/dom.js';
import { AVATAR_COLORS, MAX_NAME_LENGTH } from '../../data/profile-options.js';
import { avatar } from '../../shared/avatar.js';
import { colorPicker } from './color-picker.js';
import { courseField } from './course-field.js';
import { completionBar } from './completion-bar.js';
import { genderPicker } from './gender-picker.js';
import { profileCompletion } from './profile-completion.js';

/**
 * Formulario de nombre y color, para crear o editar un perfil.
 * initial: { name, color, gender } con los valores de partida.
 * onSave({ name, color, gender }) guarda los datos (promesa); si falla, se muestra errorText.
 * askCourse (opcional): pide elegir el curso (solo al crear); onSave recibe también courseId.
 * extra (opcional): un elemento que se coloca justo antes del botón de guardar.
 * showCompletion (opcional): muestra la barra "Perfil al X %". El formulario devuelto tiene setBell(activo)
 * para avisar de si los avisos de este perfil están activados en este móvil.
 */
export function profileForm({ initial, submitLabel, errorText, onSave, extra, showCompletion = false, askCourse = false }) {
  let color = initial.color;
  let name = initial.name;
  let gender = initial.gender || null;
  let bell = null;
  let courseId = null;

  const bar = showCompletion ? completionBar(profileCompletion({ name, color, gender, bell })) : null;
  const refreshBar = () => bar && bar.update(profileCompletion({ name, color, gender, bell }));

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
      refreshBar();
    },
  });

  const picker = colorPicker({
    colors: AVATAR_COLORS,
    value: color,
    onChange: (hex) => {
      color = hex;
      drawPreview();
      refreshBar();
    },
  });

  const genders = genderPicker({
    value: gender,
    onChange: (value) => {
      gender = value;
      refreshBar();
    },
  });

  const courses = askCourse ? courseField({ onChange: (id) => (courseId = id) }) : null;

  async function onSubmit(event) {
    event.preventDefault();
    error.textContent = '';
    if (!name.trim()) {
      error.textContent = 'Escribe un nombre para el perfil.';
      nameInput.focus();
      return;
    }
    if (askCourse && !courseId) {
      error.textContent = 'Elige el curso del perfil.';
      return;
    }
    submit.disabled = true;
    try {
      await onSave({ name, color, gender, courseId });
    } catch (err) {
      console.error(err);
      error.textContent = errorText;
      submit.disabled = false;
    }
  }

  drawPreview();

  const form = h(
    'form',
    { class: 'stack', style: { '--gap': '24px' }, onSubmit },
    preview,
    bar,
    h('div', { class: 'field' }, h('label', { class: 'field__label', for: 'profile-name' }, 'Nombre'), nameInput),
    h('div', { class: 'field' }, h('span', { class: 'field__label' }, 'Color del icono'), picker),
    h('div', { class: 'field' }, h('span', { class: 'field__label' }, '¿Eres chico o chica?'), genders, h('p', { class: 'field__hint' }, 'Sirve para escribir tu nivel bien: Aventurero o Aventurera.')),
    courses,
    extra,
    error,
    submit,
  );

  form.setBell = (active) => {
    bell = active;
    refreshBar();
  };
  return form;
}
