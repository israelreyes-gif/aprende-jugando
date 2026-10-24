import { h } from '../../core/dom.js';
import { getConnection, setConnection } from '../../core/api.js';
import { validateConnection } from './validate-connection.js';

/** Formulario con la dirección del Worker y la clave. Llama a onSaved() al guardar. */
export function connectionForm({ onSaved }) {
  const current = getConnection();
  const urlInput = h('input', {
    class: 'input', id: 'api-url', type: 'url', inputmode: 'url', autocomplete: 'off',
    placeholder: 'https://mi-worker.usuario.workers.dev', value: current.url, required: true,
  });
  const keyInput = h('input', {
    class: 'input', id: 'api-key', type: 'password', autocomplete: 'off',
    placeholder: 'La clave que pusiste en el Worker', value: current.key, required: true,
  });
  const error = h('p', { class: 'field__error', role: 'alert' });

  function submit(event) {
    event.preventDefault();
    const url = urlInput.value.trim();
    const key = keyInput.value.trim();
    error.textContent = validateConnection(url, key);
    if (error.textContent) return;
    setConnection(url, key);
    onSaved();
  }

  return h(
    'form',
    { class: 'stack', style: { '--gap': '20px' }, onSubmit: submit },
    h('div', { class: 'field' }, h('label', { class: 'field__label', for: 'api-url' }, 'Dirección del Worker'), urlInput),
    h('div', { class: 'field' }, h('label', { class: 'field__label', for: 'api-key' }, 'Clave de conexión'), keyInput),
    error,
    h('button', { class: 'btn btn--primary btn--block', type: 'submit' }, 'Guardar y entrar'),
  );
}
