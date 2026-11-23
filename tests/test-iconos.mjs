// Iconos del manifiesto: PNG instalables (Android/Chrome) además del SVG, con tamaños reales y un icono "maskable" a sangre completa.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.env.REAL_REPO || path.resolve(new URL('..', import.meta.url).pathname);
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'));
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };

for (const k of ['name', 'short_name', 'start_url', 'scope', 'display', 'theme_color', 'background_color']) assert.ok(manifest[k], `falta ${k}`);
assert.equal(manifest.display, 'standalone'); ok('manifiesto con los campos básicos (standalone)');

const png = (file) => { const b = fs.readFileSync(path.join(ROOT, file)); assert.equal(b.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${file} no es PNG`); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), colorType: b[25] }; };
for (const icon of manifest.icons) {
  assert.ok(fs.existsSync(path.join(ROOT, icon.src)), `${icon.src} no existe`);
  if (icon.type === 'image/png') { const { w, h } = png(icon.src); assert.equal(`${w}x${h}`, icon.sizes, `${icon.src}: tamaño real distinto del declarado`); }
}
ok(`${manifest.icons.length} iconos declarados, todos existen y los PNG miden lo que dicen`);

const has = (size, purpose) => manifest.icons.some((i) => i.type === 'image/png' && i.sizes === size && i.purpose === purpose);
assert.ok(has('192x192', 'any') && has('512x512', 'any'), 'faltan los PNG 192 y 512 (any)');
assert.ok(has('512x512', 'maskable'), 'falta el PNG maskable 512');
ok('PNG 192 y 512 (any) y 512 maskable presentes');
assert.equal(png('icons/icon-maskable-512.png').colorType, 2, 'el maskable debe ser opaco (RGB, sin transparencia en las esquinas)');
ok('el icono maskable es opaco (a sangre completa)');
assert.deepEqual(manifest.icons.filter((i) => i.purpose && i.purpose.includes(' ')), [], 'no mezclar "any maskable" en un mismo icono');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
assert.match(html, /rel="apple-touch-icon" href="icons\/apple-touch-icon\.png"/); assert.equal(png('icons/apple-touch-icon.png').w, 180);
ok('icono de iPhone/iPad (apple-touch-icon 180×180) intacto');
console.log(n, 'comprobaciones');
