import fs from 'node:fs';
import path from 'node:path';

// Lo que forma la app que se guarda en el móvil. No entra lo que no se sirve a la página
// (pruebas, Worker, herramientas, documentación) ni lo que el navegador pide por su cuenta (sw.js y sw/).
const EXCLUDED = /^(\.git|\.github|tests|worker|tools|sw|node_modules|README\.md|sw\.js)(\/|$)/;

/** Rutas (relativas a `root`, con "/") de todos los archivos de la app, ordenadas. */
export function appFiles(root) {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = dir ? `${dir}/${entry.name}` : entry.name;
      if (EXCLUDED.test(rel)) continue;
      if (entry.isDirectory()) walk(rel);
      else out.push(rel);
    }
  };
  walk('');
  return out.sort();
}
