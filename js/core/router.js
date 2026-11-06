import { loadingView } from '../shared/loading-view.js';
import { errorView } from '../shared/error-view.js';
import { compile, findRoute } from './route-match.js';
import { onDataEvent } from './api/data-events.js';
import { keepOpenState } from './keep-open-state.js';

const routes = [];
let rootEl = null;
let guard = null;
let onAuthError = null;
let renderToken = 0;

/**
 * Registra una ruta. El manejador recibe los parámetros y devuelve (o promete) un nodo DOM.
 * live: true -> si, tras pintar una copia guardada, llegan datos nuevos, la pantalla se repinta sola (solo pantallas de consulta).
 */
export function route(pattern, handler, { live = false } = {}) {
  routes.push({ ...compile(pattern), handler, live });
}

export function currentPath() {
  const path = location.hash.replace(/^#/, '');
  return path === '' ? '/' : path;
}

export function go(href, { replace = false } = {}) {
  if (replace) location.replace(href);
  else location.hash = href;
}

export function reload() {
  return render();
}

/**
 * guard(path) puede devolver una ruta '#/...' a la que redirigir, o null para continuar.
 * onAuthError(err, path) hace lo mismo cuando una petición dice que la sesión ya no vale (error con code 'auth').
 */
export function start(root, options = {}) {
  rootEl = root;
  guard = options.guard || null;
  onAuthError = options.onAuthError || null;
  window.addEventListener('hashchange', render);
  onDataEvent(onData);
  return render();
}

async function render() {
  const path = currentPath();

  if (guard) {
    const redirect = guard(path);
    if (redirect && redirect !== `#${path}`) {
      go(redirect, { replace: true });
      return;
    }
  }

  const token = ++renderToken;
  const match = findRoute(routes, path);
  rootEl.replaceChildren(loadingView());

  try {
    if (!match) throw Object.assign(new Error('Página no encontrada'), { status: 404 });
    const view = await match.handler(match.params);
    if (token !== renderToken) return;
    rootEl.replaceChildren(view);
    window.scrollTo(0, 0);
  } catch (err) {
    if (token !== renderToken) return;
    const redirect = err.code === 'auth' && onAuthError ? onAuthError(err, path) : null;
    if (redirect) {
      go(redirect, { replace: true });
      return;
    }
    console.error(err);
    rootEl.replaceChildren(errorView(err, reload));
  }
}

const typing = () => rootEl.contains(document.activeElement) && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);

/** Datos nuevos tras pintar una copia guardada: repinta en silencio (sin spinner, sin saltar arriba, sin cerrar los desplegables). */
async function onData(reason, detail) {
  const path = currentPath();
  if (reason === 'auth') {
    const redirect = onAuthError ? onAuthError(detail, path) : guard ? guard(path) : null;
    if (redirect && redirect !== `#${path}`) go(redirect, { replace: true });
    return;
  }
  const match = findRoute(routes, path);
  if (!match || !match.live || typing()) return;
  const token = renderToken;
  try {
    const view = await match.handler(match.params);
    if (token !== renderToken || typing()) return;
    const restore = keepOpenState(rootEl);
    rootEl.replaceChildren(view);
    restore();
  } catch {
    /* si falla, se deja la pantalla que ya se ve */
  }
}
