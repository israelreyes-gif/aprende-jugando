// Fuentes propias: ningún recurso externo, cada @font-face apunta a un fichero que existe y cubre los pesos que usa el CSS.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.env.REAL_REPO || path.resolve(new URL('..', import.meta.url).pathname);
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const cssFiles = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? cssFiles(`${dir}/${e.name}`) : e.name.endsWith('.css') ? [`${dir}/${e.name}`] : []));
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };

const html = read('index.html');
assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/, 'index.html no debe pedir nada a Google');
assert.match(html, /href="css\/fonts\.css"/); assert.match(html, /font-src 'self'/); assert.match(html, /style-src 'self';/);
ok('index.html: sin Google, CSP font-src y style-src solo propios');

for (const f of cssFiles('css')) assert.doesNotMatch(read(f), /https?:\/\//, `${f}: URL externa`);
ok('ningún CSS apunta a un servidor externo');

const css = read('css/fonts.css'); const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);
const declared = new Map(); // familia -> pesos
for (const body of faces) {
  const family = body.match(/font-family:\s*'([^']+)'/)[1]; const weight = Number(body.match(/font-weight:\s*(\d+)/)[1]);
  const file = body.match(/url\('\.\.\/(fonts\/[^']+\.woff2)'\)/)?.[1]; assert.ok(file, `${family} ${weight}: sin fichero woff2`);
  const bytes = fs.readFileSync(path.join(ROOT, file)); assert.equal(bytes.subarray(0, 4).toString('latin1'), 'wOF2', `${file} no es woff2`);
  assert.ok(bytes.length > 5000 && bytes.length < 80000, `${file}: tamaño raro`); assert.match(body, /font-display:\s*swap/);
  declared.set(family, [...(declared.get(family) || []), weight]);
}
assert.deepEqual([...declared.keys()].sort(), ['Fredoka', 'Nunito']);
ok(`${faces.length} @font-face con su fichero woff2 (${[...declared].map(([f, w]) => `${f} ${w.join('/')}`).join(', ')})`);

const nunito = new Set(declared.get('Nunito')); const used = new Set();
for (const f of cssFiles('css')) for (const m of read(f).matchAll(/font-weight:\s*(\d+)/g)) used.add(Number(m[1]));
for (const w of used) assert.ok(nunito.has(w) || declared.get('Fredoka').includes(w), `peso ${w} usado en el CSS sin @font-face`);
ok('todos los pesos de letra que usa el CSS tienen fuente propia: ' + [...used].sort().join(', '));
for (const lic of ['fonts/LICENSE-Nunito.txt', 'fonts/LICENSE-Fredoka.txt']) assert.match(read(lic), /SIL Open Font License/);
ok('licencias OFL incluidas');
console.log(n, 'comprobaciones');
