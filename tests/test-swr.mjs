import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/#/' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, location: dom.window.location, localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage });
const R = new URL('../js', import.meta.url).pathname;
let server = { rows: [{ id: 1 }] }; let gets = 0; let authFail = false;
globalThis.fetch = async (url, init = {}) => {
  if ((init.method || 'GET') === 'GET') {
    gets++;
    if (authFail) return { ok: false, status: 401, json: async () => ({ error: 'Sesión no válida' }) };
    return { ok: true, json: async () => server.rows };
  }
  server.rows = [...server.rows, { id: 2 }];
  return { ok: true, json: async () => ({ ok: true }) };
};
const { api, setConnection } = await import(`${R}/core/api.js`); setConnection('https://w.example', 'k');
const { onDataEvent } = await import(`${R}/core/api/data-events.js`);
const { clearMemoryCache } = await import(`${R}/core/api/memory-cache.js`);
const events = []; onDataEvent((r) => events.push(r));
const tick = () => new Promise((r) => setTimeout(r, 20));
let ok = 0; const pass = (m) => { ok++; console.log('✓', m); };
const realNow = Date.now; let offset = 0; Date.now = () => realNow() + offset;

assert.deepEqual(await api.list('profiles'), [{ id: 1 }]); assert.equal(gets, 1); pass('primera lectura: va al servidor');
assert.deepEqual(await api.list('profiles'), [{ id: 1 }]); assert.equal(gets, 1); pass('segunda lectura reciente: sin petición');

// Dos lecturas iguales a la vez comparten una sola petición
clearMemoryCache(); gets = 0;
await Promise.all([api.list('profiles'), api.list('profiles')]); assert.equal(gets, 1); pass('lecturas iguales simultáneas: una sola petición');

// Copia vieja: se pinta al instante y se refresca en segundo plano
server.rows = [{ id: 1 }, { id: 9 }]; offset += 10000; gets = 0; events.length = 0;
assert.deepEqual(await api.list('profiles'), [{ id: 1 }]); pass('copia antigua: devuelve al instante lo que había');
await tick(); assert.equal(gets, 1); assert.deepEqual(events, ['changed']); pass('refresca en segundo plano y avisa de que hay datos nuevos');
assert.deepEqual(await api.list('profiles'), [{ id: 1 }, { id: 9 }]); pass('la lectura siguiente ya trae los datos nuevos');

// Sin cambios en el servidor no hay aviso
offset += 10000; events.length = 0; await api.list('profiles'); await tick(); assert.deepEqual(events, []); pass('si los datos no cambian, no hay aviso (no se repinta)');

// Escribir olvida la copia
await api.insert('profiles', { id: 2 }); gets = 0;
assert.deepEqual(await api.list('profiles'), [{ id: 1 }, { id: 9 }, { id: 2 }]); assert.equal(gets, 1); pass('tras escribir, la lectura va al servidor y trae lo nuevo');

// Sesión caducada durante el refresco
offset += 10000; events.length = 0; authFail = true;
await api.list('profiles'); await tick(); assert.deepEqual(events, ['auth']); authFail = false; pass('si al refrescar la sesión ya no vale, se avisa para volver a entrar');

// La zona de padres no se pinta con copias del dispositivo
clearMemoryCache(); sessionStorage.setItem('aj.session.parent', 'tok'); location.hash = '#/parents';
localStorage.setItem('aj.cache:sessions?x=1', JSON.stringify([{ viejo: true }]));
gets = 0; server.rows = [{ nuevo: true }];
assert.deepEqual(await api.list('sessions', { where: { x: 1 } }), [{ nuevo: true }]); assert.equal(gets, 1); pass('zona de padres: nunca se pinta con la copia del dispositivo');
location.hash = '#/p/alex'; clearMemoryCache();
localStorage.setItem('aj.cache:sessions?x=1', JSON.stringify([{ viejo: true }]));
console.log(`\n${ok} comprobaciones OK`);

// Router: una pantalla "live" se repinta en silencio al llegar datos nuevos; una que no lo es, no.
{
  const { route, start } = await import(`${R}/core/router.js`);
  const { emitDataEvent } = await import(`${R}/core/api/data-events.js`);
  const mk = (txt, withDetails) => { const d = document.createElement('div'); d.innerHTML = withDetails ? `<details><summary>x</summary>${txt}</details>` : txt; return d; };
  let n = 0;
  route('/live', () => mk('v' + ++n, true), { live: true });
  route('/fija', () => mk('f' + ++n), {});
  const root = document.createElement('div'); document.body.append(root);
  window.scrollTo = () => {};
  location.hash = '#/live'; await start(root); await tick();
  root.querySelector('details').open = true; const v0 = root.textContent;
  emitDataEvent('changed'); await tick();
  assert.notEqual(root.textContent, v0); assert.equal(root.querySelector('details').open, true); pass('pantalla live: se repinta y conserva los desplegables abiertos');
  const input = document.createElement('input'); root.append(input); input.focus();
  const v1 = root.textContent; emitDataEvent('changed'); await tick(); assert.equal(root.textContent, v1); pass('si se está escribiendo no se repinta');
  input.remove(); document.body.focus();
  location.hash = '#/fija'; await tick(); const before = root.textContent;
  emitDataEvent('changed'); await tick(); assert.equal(root.textContent, before); pass('pantalla no live (ejercicios): nunca se repinta sola');
}
console.log(`\n${ok} comprobaciones OK (con router)`);
