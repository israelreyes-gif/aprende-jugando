// Escribe sw/manifest.js con la lista de archivos de la app y su huella.
// Uso: node tools/build-sw-manifest.mjs [carpeta]   (por defecto, la raíz del repo)
import fs from 'node:fs';
import path from 'node:path';
import { manifestText } from './manifest-text.js';

const root = path.resolve(process.argv[2] || new URL('../', import.meta.url).pathname);
fs.writeFileSync(path.join(root, 'sw/manifest.js'), manifestText(root));
console.log(`sw/manifest.js escrito en ${root}`);
