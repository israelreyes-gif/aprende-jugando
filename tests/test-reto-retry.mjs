import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage });
const R = new URL('../js', import.meta.url).pathname;
const { startRetoWithRetry } = await import(`${R}/data/reto/start-reto-retry.js`);
const { answersSaver } = await import(`${R}/features/reto/answers-saver.js`);

let calls = 0;
const flaky = (failures) => async (args) => { calls++; if (calls <= failures) throw new Error('sin red'); return { id: 'r1', ...args }; };
const waits = [1, 1, 1];

let r = await startRetoWithRetry({ day: 'd' }, { waits, start: flaky(0) }); assert.equal(r.id, 'r1'); assert.equal(calls, 1); console.log('✓ si va bien, una sola llamada');
calls = 0; r = await startRetoWithRetry({ day: 'd' }, { waits, start: flaky(2) }); assert.equal(r.id, 'r1'); assert.equal(calls, 3); console.log('✓ reintenta en silencio y acaba creándolo');
calls = 0; await assert.rejects(startRetoWithRetry({ day: 'd' }, { waits, start: flaky(99) }), /sin red/); assert.equal(calls, 4); console.log('✓ tras los reintentos lanza el error (1 + 3 intentos)');

// El guardado de respuestas espera al id del reto aunque se esté creando
const saved = []; const { saveRetoAnswers } = await import(`${R}/data/reto/save-answers.js`);
let release; const idPromise = new Promise((res) => { release = res; });
globalThis.fetch = async (url, init = {}) => { saved.push([init.method, String(url)]); return { ok: true, json: async () => ({}) }; };
const { setConnection } = await import(`${R}/core/api.js`); setConnection('https://w.example', 'k');
const saver = answersSaver(() => idPromise, () => {});
saver.save([{ questionId: 'q1', correct: true }]);
await new Promise((res) => setTimeout(res, 20)); assert.equal(saved.length, 0); console.log('✓ no guarda hasta que el reto tiene id');
release('r1'); await saver.flush(); assert.ok(saved.some(([m, u]) => m === 'PATCH' && u.includes('reto_diario'))); console.log('✓ cuando el reto existe, guarda las respuestas');
