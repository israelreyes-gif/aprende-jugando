// La lista de archivos del service worker (sw/manifest.js) tiene que estar al día con lo que hay en el repo.
// Si falla: ejecutar `node tools/build-sw-manifest.mjs` y subir también sw/manifest.js.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { manifestText } from '../tools/manifest-text.js';

const root = new URL('../', import.meta.url).pathname;
const ok = (name) => console.log(`✓ ${name}`);

assert.equal(fs.readFileSync(`${root}sw/manifest.js`, 'utf8'), manifestText(root), 'sw/manifest.js está desactualizado: ejecuta node tools/build-sw-manifest.mjs');
ok('sw/manifest.js está al día con los archivos del repo');

const files = new Set([...fs.readFileSync(`${root}sw/manifest.js`, 'utf8').matchAll(/^ {2}'(\.\/[^']+)':/gm)].map((m) => m[1]));
const html = fs.readFileSync(`${root}index.html`, 'utf8');
const used = [...html.matchAll(/(?:href|src)="([^"#:]+)"/g)].map((m) => `./${m[1]}`);
assert.ok(used.length > 20);
for (const file of used) assert.ok(files.has(file), `index.html usa ${file} y no está en la lista del service worker`);
ok(`todo lo que carga index.html (${used.length} archivos) está en la lista`);

for (const file of ['./index.html', './js/main.js', './manifest.webmanifest']) assert.ok(files.has(file), file);
for (const file of files) assert.ok(!/^\.\/(tests|worker|tools|sw|\.git)\//.test(file) && file !== './sw.js' && file !== './README.md', file);
ok('entra lo necesario y no entran pruebas, Worker, herramientas ni el propio service worker');
