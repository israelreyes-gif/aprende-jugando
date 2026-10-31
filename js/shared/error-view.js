import { h } from '../core/dom.js';

function describeError(err) {
  if (err.status === 404) return 'No hemos encontrado esta página.';
  if (err.status === 401) return 'La clave de conexión no es correcta.';
  if (err.code === 'not-configured') return 'La app todavía no está conectada.';
  if (err.code === 'timeout') return 'El servidor tarda demasiado en responder. Inténtalo de nuevo.';
  if (err instanceof TypeError) return 'No hay conexión con el servidor. Comprueba internet e inténtalo de nuevo.';
  return 'Algo ha salido mal. Inténtalo de nuevo.';
}

export function errorView(err, onRetry) {
  const showSetup = err.status === 401 || err.code === 'not-configured';
  return h(
    'div',
    { class: 'state', role: 'alert' },
    h('p', { class: 'title-lg' }, '¡Vaya!'),
    h('p', { class: 'state__text' }, describeError(err)),
    err.status === 404 ? null : h('button', { class: 'btn btn--primary', type: 'button', onClick: onRetry }, 'Reintentar'),
    showSetup ? h('a', { class: 'btn btn--outline', href: '#/setup' }, 'Revisar la conexión') : null,
    h('a', { class: 'btn btn--outline', href: '#/' }, 'Ir al inicio'),
  );
}
