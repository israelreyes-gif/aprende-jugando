import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { appFiles } from './manifest-files.js';

/** Huella corta del contenido (la misma cuenta la hace el service worker al descargar). */
export const fingerprint = (bytes) => crypto.createHash('sha1').update(bytes).digest('hex').slice(0, 12);

/** El texto completo de sw/manifest.js para la app que hay en `root`. */
export function manifestText(root) {
  const entries = appFiles(root).map((file) => [`./${file}`, fingerprint(fs.readFileSync(path.join(root, file)))]);
  const build = fingerprint(Buffer.from(entries.map(([file, hash]) => `${file}:${hash}`).join('\n')));
  const lines = entries.map(([file, hash]) => `  '${file}': '${hash}',`).join('\n');
  return `// GENERADO por tools/build-sw-manifest.mjs: no se edita a mano.
// BUILD identifica esta versión de la app; FILES lleva la huella de cada archivo que se guarda en el móvil.
const BUILD = '${build}';
const FILES = {
${lines}
};
`;
}
