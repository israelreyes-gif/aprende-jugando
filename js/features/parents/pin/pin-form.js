import { h } from '../../../core/dom.js';
import { appHeader } from '../../../shared/app-header.js';

export function pinInput(id) {
  return h('input', {
    class: 'input', id, type: 'password', inputmode: 'numeric', autocomplete: 'off',
    maxlength: 8, pattern: '[0-9]*', placeholder: '••••',
  });
}

/**
 * Pantalla con uno o varios campos de PIN. onSubmit() devuelve un mensaje de error
 * (texto) si algo va mal, o null si todo ha ido bien.
 */
export function pinView({ title, sub, fields, buttonLabel, onSubmit, back }) {
  const error = h('p', { class: 'field__error', role: 'alert' });
  const submit = h('button', { class: 'btn btn--primary btn--block', type: 'submit' }, buttonLabel);

  async function handleSubmit(event) {
    event.preventDefault();
    error.textContent = '';
    submit.disabled = true;
    try {
      const message = await onSubmit();
      if (message) {
        error.textContent = message;
        submit.disabled = false;
      }
    } catch (err) {
      console.error(err);
      error.textContent = 'No se ha podido comprobar el PIN. Inténtalo de nuevo.';
      submit.disabled = false;
    }
  }

  const form = h(
    'form',
    { class: 'stack', style: { '--gap': '20px' }, onSubmit: handleSubmit },
    ...fields.map(({ label, input }) => h('div', { class: 'field' }, h('label', { class: 'field__label', for: input.id }, label), input)),
    error,
    submit,
  );

  return h('main', { class: 'screen' }, appHeader({ title, sub, back, shield: true }), h('div', { class: 'screen__body' }, form));
}
