// Antes de borrar un perfil se ofrece una copia de seguridad (si no hay una de hoy).
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://app.example/' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document });
const R = new URL('../js/features/backup', import.meta.url).pathname;
const { ensureRecentBackup } = await import(`${R}/ensure-recent-backup.js`);
const { backupWithTap } = await import(`${R}/backup-with-tap.js`);
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };

const now = new Date('2026-11-24T12:00:00Z');
const asks = []; const answers = [];
const ask = async (opts) => { asks.push(opts); return answers.shift(); };
const run = (last, backup) => ensureRecentBackup('Alex', { load: async () => last, backup, ask, now });

assert.equal(await run('2026-11-24T08:00:00Z', async () => assert.fail('no debería hacer copia')), true); assert.equal(asks.length, 0);
ok('con copia de hoy no pregunta nada');

answers.push(false); assert.equal(await run(null, async () => 'saved'), false);
assert.match(asks[0].title, /Antes de borrar a Alex/); assert.match(asks[0].message, /Todavía no has hecho ninguna copia/);
assert.deepEqual(asks[0].actions.map((a) => a.label), ['Cancelar', 'Borrar sin copia', 'Hacer copia ahora']); ok('sin copia: ofrece hacerla; Cancelar no sigue');

asks.length = 0; answers.push('skip'); assert.equal(await run('2026-11-20T10:00:00Z', async () => assert.fail('no')), true);
assert.match(asks[0].message, /Última copia: hace 4 días/); ok('"Borrar sin copia" sigue adelante y dice la antigüedad de la última copia');

answers.push('backup'); assert.equal(await run(null, async () => 'saved'), true); ok('"Hacer copia ahora" y se guarda: sigue');

asks.length = 0; answers.push('backup', 'skip'); let tries = 0;
assert.equal(await run(null, async () => (++tries, 'cancelled')), true); assert.equal(tries, 1); assert.equal(asks.length, 2);
ok('si se cancela o falla la copia, vuelve a preguntar (no borra sin que lo elijas)');

// backupWithTap: el iPhone pide una pulsación nueva
const calls = []; const finishes = ['needs-tap', 'saved'];
const tapAsk = async (o) => (calls.push(o.title), 'save');
assert.equal(await backupWithTap({ build: async () => ({}), finish: async () => finishes.shift(), ask: tapAsk, tell: async () => {} }), 'saved'); assert.deepEqual(calls, ['Copia lista']);
ok('copia en iPhone: pide pulsar "Guardar copia" y la guarda');
assert.equal(await backupWithTap({ build: async () => ({}), finish: async () => 'needs-tap', ask: async () => false, tell: async () => {} }), 'cancelled'); ok('copia en iPhone: cancelar la segunda pulsación = cancelada');
let told = 0; assert.equal(await backupWithTap({ build: async () => { throw new Error('x'); }, tell: async () => told++ }), 'error'); assert.equal(told, 1); ok('si la copia falla, avisa y devuelve error');

console.log(`\n${n} comprobaciones OK`);
