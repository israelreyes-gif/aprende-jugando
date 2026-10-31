// Ejecuta todas las pruebas una detrás de otra y resume cuáles pasan.
// Las pruebas con navegador necesitan la app servida en el puerto 8761: la sirve este mismo script.
//
// Las pruebas no corren sobre el repo directamente, sino sobre una copia temporal con los temas de prueba
// de `fixtures/content/` añadidos (Sociales, Lengua y Sciences aún no tienen temas reales; Matemáticas y su tema
// «Tablas» se sustituyen por versiones de preguntas fijas para poder comprobar respuestas en pantalla).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { serveApp } from './serve-app.mjs';
import { manifestText } from '../tools/manifest-text.js';

const repo = new URL('../', import.meta.url).pathname;
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'aprende-tests-'));
const skip = (src) => !/[\\/](\.git|node_modules|shots)([\\/]|$)/.test(src);
fs.cpSync(repo, work, { recursive: true, filter: skip });
fs.symlinkSync(`${repo}tests/node_modules`, `${work}/tests/node_modules`);
const content = `${work}/js/content/4-primaria`;
const fixtures = `${work}/tests/fixtures/content`;
for (const subject of ['sociales', 'lengua', 'sciences']) fs.cpSync(`${fixtures}/${subject}`, `${content}/${subject}`, { recursive: true });
fs.rmSync(`${content}/mates/tablas`, { recursive: true });
fs.cpSync(`${fixtures}/mates`, `${content}/mates`, { recursive: true }); // índice con 1 tema y «Tablas» con preguntas fijas
fs.cpSync(`${fixtures}/ingles/verb-to-be`, `${content}/ingles/verb-to-be`, { recursive: true });
const inglesIndex = `${content}/ingles/index.js`;
fs.writeFileSync(inglesIndex, fs.readFileSync(inglesIndex, 'utf8').replace('export const topics = [', "export const topics = [\n  { id: 'verb-to-be', emoji: '🧩', title: 'Verb to be', minutes: 5, load: () => import('./verb-to-be/index.js') },"));
// La lista de archivos del service worker se rehace para la copia (lleva archivos de prueba distintos a los del repo).
fs.writeFileSync(`${work}/sw/manifest.js`, manifestText(work));

const dir = `${work}/tests/`;
// Estas se ejecutan sobre el repo real (necesitan el índice verdadero de Matemáticas).
const onRepo = new Set(['test-manifest.mjs', 'test-topic.js', 'test-numeros.js', 'test-reto-data.mjs', 'test-reto-load.mjs', 'test-reto-plan.mjs']);
fs.mkdirSync(`${dir}shots`, { recursive: true });
const only = process.argv[2];
const files = fs.readdirSync(dir).filter((f) => /^test-.*\.(js|mjs)$/.test(f) && (!only || f.includes(only))).sort();

const server = await serveApp(8761, work);
const failed = [];
for (const file of files) {
  const started = Date.now();
  const code = await new Promise((resolve) => {
    const child = spawn(process.execPath, ['--no-warnings', onRepo.has(file) ? `${repo}tests/${file}` : file], { cwd: onRepo.has(file) ? `${repo}tests/` : dir, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.on('data', (d) => { out += d; if (process.env.VERBOSE) process.stdout.write(d); });
    child.stderr.on('data', (d) => { out += d; if (process.env.VERBOSE) process.stderr.write(d); });
    const timer = setTimeout(() => child.kill('SIGKILL'), 4 * 60 * 1000);
    child.on('close', (c) => {
      clearTimeout(timer);
      if (c !== 0 || /^\s*✗/m.test(out)) {
        console.log(`\n--- ${file} ---\n${out.split('\n').slice(-40).join('\n')}`);
        // En GitHub Actions, un resumen del fallo aparece como anotación en la pantalla de la ejecución.
        if (process.env.GITHUB_ACTIONS) console.log(`::error title=${file}::${out.split('\n').slice(-12).join('\n').replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`);
      }
      resolve(c !== 0 || /^\s*✗/m.test(out) ? 1 : 0);
    });
  });
  console.log(`${code === 0 ? '✓' : '✗'} ${file} (${Math.round((Date.now() - started) / 1000)} s)`);
  if (code !== 0) failed.push(file);
}
server.close();
fs.rmSync(work, { recursive: true, force: true });
console.log(failed.length ? `\n${failed.length} de ${files.length} con fallos: ${failed.join(', ')}` : `\nTodo bien: ${files.length} pruebas`);
process.exit(failed.length ? 1 : 0);
