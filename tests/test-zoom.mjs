// Zoom con los dedos permitido (accesibilidad) sin que iOS haga zoom solo al tocar un campo (letra de los campos >= 16 px).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.env.REAL_REPO || path.resolve(new URL('..', import.meta.url).pathname);
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };

const viewport = read('index.html').match(/<meta name="viewport" content="([^"]*)"/)[1];
assert.doesNotMatch(viewport, /user-scalable\s*=\s*(no|0)/i, 'el viewport bloquea el zoom'); assert.doesNotMatch(viewport, /maximum-scale\s*=\s*1(\.0)?\b/i, 'maximum-scale=1 bloquea el zoom');
assert.match(viewport, /width=device-width/); assert.match(viewport, /viewport-fit=cover/);
ok('viewport sin user-scalable=no ni maximum-scale=1 (se puede ampliar), con viewport-fit=cover');

const css = fs.readdirSync(path.join(ROOT, 'css'), { recursive: true }).filter((f) => f.endsWith('.css')).map((f) => [f, read(`css/${f}`)]);
for (const [f, text] of css) for (const m of text.matchAll(/touch-action:\s*([^;}]+)/g)) assert.doesNotMatch(m[1], /pan-x pan-y|\bnone\b/, `${f}: touch-action ${m[1].trim()} impide ampliar con los dedos`);
assert.match(read('css/base.css'), /html, body \{ touch-action: manipulation;/); ok('touch-action: manipulation en html/body (ampliar sí, doble toque no) y nada lo bloquea en el CSS');

const input = read('css/components/forms.css').match(/\.input\s*\{[^}]*\}/s)?.[0] || ''; const size = Number(input.match(/font-size:\s*(\d+)px/)?.[1]);
assert.ok(size >= 16, `.input debe tener letra >= 16 px para que iOS no haga zoom al enfocar (tiene ${size})`); ok(`campos .input con letra de ${size} px (iOS no hace zoom al tocarlos)`);
const bare = []; for (const f of fs.readdirSync(path.join(ROOT, 'js'), { recursive: true }).filter((x) => x.endsWith('.js') && !x.startsWith('content'))) for (const m of read(`js/${f}`).matchAll(/h\('(input|textarea|select)',\s*\{([^}]*)\}/g)) if (!/type:\s*'file'/.test(m[2]) && !/class:\s*'[^']*\binput\b/.test(m[2])) bare.push(`${f}: <${m[1]}>`);
assert.deepEqual(bare, [], 'campos sin la clase .input (podrían tener letra pequeña): ' + bare.join(', ')); ok('todos los campos del código usan la clase .input');
console.log(n, 'comprobaciones');
