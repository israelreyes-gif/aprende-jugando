import assert from 'node:assert/strict';
const B = '../js/content/4-primaria/mates/lib/';
const { palabras } = await import(B + 'palabras.js');
const { toRoman } = await import(B + 'to-roman.js');
const { fromRoman } = await import(B + 'from-roman.js');
const { cleanRoman } = await import(B + 'clean-roman.js');
const { figuras } = await import(B + 'figuras.js');
const { figuraSvg } = await import(B + 'figura-svg.js');
const cases = { 1: 'uno', 15: 'quince', 21: 'veintiuno', 45: 'cuarenta y cinco', 100: 'cien', 101: 'ciento uno', 999: 'novecientos noventa y nueve', 1000: 'mil', 1001: 'mil uno', 21000: 'veintiún mil', 31500: 'treinta y un mil quinientos', 100000: 'cien mil', 123456: 'ciento veintitrés mil cuatrocientos cincuenta y seis', 999999: 'novecientos noventa y nueve mil novecientos noventa y nueve' };
for (const [n, w] of Object.entries(cases)) assert.equal(palabras(+n), w, n);
for (let n = 1; n < 400; n++) { assert.equal(fromRoman(toRoman(n)), n); }
assert.equal(toRoman(49), 'XLIX'); assert.equal(toRoman(94), 'XCIV'); assert.equal(toRoman(4), 'IV'); assert.ok(Number.isNaN(fromRoman('ABC')));
assert.equal(cleanRoman(' xl-ix '), 'XLIX'); assert.equal(cleanRoman(null), '');
assert.equal(figuras.length, 9); assert.ok(figuras.every((f) => f.d.startsWith('<')));
assert.ok(figuraSvg(figuras[5], true).includes('fig--big')); assert.ok(figuraSvg(figuras[5]).includes('points="50.0,10.0'));
console.log('lib OK');
