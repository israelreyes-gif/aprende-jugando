import { loadingView, errorView } from '../shared/states.js';
import { compile, findRoute } from './route-match.js';

const routes = [];
let rootEl = null;
let guard = null;
let renderToken = 0;

/** Registra una ruta. El manejador recibe los parámetros y devuelve (o promete) un nodo DOM. */
export function route(pattern, handler) {
  routes.push({ ...compile(pattern), handler });
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

/** guard(path) puede devolver una ruta '#/...' a la que redirigir, o null para continuar. */
export function start(root, options = {}) {
  rootEl = root;
  guard = options.guard || null;
  window.addEventListener('hashchange', render);
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
    console.error(err);
    rootEl.replaceChildren(errorView(err, reload));
  }
}
