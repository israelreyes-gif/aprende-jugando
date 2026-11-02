import { h } from '../../core/dom.js';
import { appHeader } from '../../shared/app-header.js';

/** Texto de un fallo al comprobar un código (según lo que contesta el Worker). */
export function codeErrorText(err) {
  if (err.status === 401 && err.left !== undefined) return `Código incorrecto. Te quedan ${err.left} intento${err.left === 1 ? '' : 's'}.`;
  if (err.status === 423) {
    const minutes = Math.max(1, Math.round((err.retryIn || 60) / 60));
    return `Demasiados intentos. Espera ${minutes} minuto${minutes === 1 ? '' : 's'} y vuelve a probar.`;
  }
  if (err.status === 401) return 'Código incorrecto.';
  return 'No se ha podido comprobar el código. Revisa la conexión e inténtalo de nuevo.';
}

/**
 * Pantalla con uno o varios campos de código. fields: [{ label, node }] (node = input o grupo ya montado).
 * onSubmit() devuelve un texto de error, o null si ha ido bien; si lanza, se traduce con codeErrorText.
 */
export function codeView({ title, sub, back, fields, buttonLabel, onSubmit, extra }) {
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
      error.textContent = codeErrorText(err);
      submit.disabled = false;
    }
  }

  const form = h(
    'form',
    { class: 'stack', style: { '--gap': '20px' }, onSubmit: handleSubmit },
    ...fields.map(({ label, node }) => (label ? h('div', { class: 'field' }, h('label', { class: 'field__label', for: node.id }, label), node) : node)),
    error,
    submit,
  );
  return h('main', { class: 'screen' }, appHeader({ title, sub, back, shield: true }), h('div', { class: 'screen__body' }, form, extra));
}
