import { errorView } from './error-view.js';

/** Pantalla para recursos que no existen (perfil borrado, tema sin contenido...). */
export function notFoundView() {
  return errorView(Object.assign(new Error('No encontrado'), { status: 404 }), () => {});
}
