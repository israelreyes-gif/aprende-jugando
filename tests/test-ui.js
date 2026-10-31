import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';

/* ---------- Entorno: navegador simulado + Worker + SQLite ---------- */
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'https://yo.github.io/aprende/', pretendToBeVisual: true });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, location: window.location, localStorage: window.localStorage, sessionStorage: window.sessionStorage });
window.scrollTo = () => {};
window.confirm = () => true;

const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname);
const env = { DB: db, API_KEY: 'k' };
let offline = false;
globalThis.fetch = async (url, init = {}) => {
  if (offline) throw new TypeError('fetch failed');
  return worker.fetch(new Request(url, init), env);
};

const errors = [];
const origError = console.error;
console.error = (...a) => { errors.push(a.map(String).join(' ')); };

const { reload } = await import('../js/core/router.js');
const { flushOutbox } = await import('../js/core/api.js');
const tablas = await import('../js/content/4-primaria/mates/tablas/index.js');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const app = () => document.getElementById('app');
const text = () => app().textContent;
const q = (sel) => app().querySelector(sel);
const qa = (sel) => [...app().querySelectorAll(sel)];
const rows = (sql, ...args) => db.sqlite.prepare(sql).all(...args);

async function settle() {
  await sleep(25);
  for (let i = 0; i < 300; i++) {
    if (!q('.spinner')) { await sleep(15); if (!q('.spinner')) return; }
    await sleep(10);
  }
  throw new Error('La pantalla se quedó cargando');
}
async function visit(hash) {
  if (location.hash === hash) reload();
  else location.hash = hash;
  await settle();
}
const type = (el, value) => { el.value = value; el.dispatchEvent(new window.Event('input', { bubbles: true })); };
const submit = (form) => form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
let steps = 0;
const ok = (name) => { steps++; console.log('  ✓', name); };

/* ---------- 1. Primer arranque: conexión ---------- */
await import('../js/main.js');
await settle();
assert.equal(location.hash, '#/setup'); assert.match(text(), /Conectar la app/); ok('sin conexión configurada, lleva a la pantalla de conexión');

type(document.getElementById('api-url'), 'http://inseguro.example');
type(document.getElementById('api-key'), 'k');
submit(q('form'));
assert.match(q('.field__error').textContent, /https/); ok('rechaza una URL que no es https');

type(document.getElementById('api-url'), 'https://w.example');
submit(q('form'));
await settle();
assert.equal(location.hash, '#/'); assert.match(text(), /¿Quién va a estudiar hoy\?/); ok('guarda la conexión y entra a la selección de perfil');

/* ---------- 2. Perfiles ---------- */
assert.equal(qa('.profile-card').length, 1); // solo "Añadir"
assert.ok(q('a[href="#/parents"]')); ok('inicio: botón Añadir y botón Zona de padres');

await visit('#/new-profile');
submit(q('form'));
assert.match(q('.field__error').textContent, /nombre/); ok('no deja crear un perfil sin nombre');
type(document.getElementById('profile-name'), 'Alex');
assert.equal(q('.avatar').textContent, 'A'); ok('la vista previa muestra la inicial');
qa('.swatch')[1].click();
assert.equal(qa('.swatch')[1].getAttribute('aria-pressed'), 'true');
submit(q('form'));
await settle(); await sleep(60); await settle();
assert.equal(location.hash, '#/');
assert.equal(qa('.profile-card').length, 2);
const alex = rows('SELECT * FROM profiles')[0];
assert.equal(alex.name, 'Alex'); assert.equal(alex.avatar_color, '#8EDBC0'); ok('crea el perfil en D1 y aparece en el inicio');

/* ---------- 3. Zona de padres: PIN ---------- */
await visit('#/parents');
assert.match(text(), /Crea un PIN/); ok('primera vez: pide crear un PIN');
type(document.getElementById('pin-new'), '12');
type(document.getElementById('pin-confirm'), '12');
submit(q('form')); await sleep(40);
assert.match(q('.field__error').textContent, /entre 4 y 8/); ok('PIN demasiado corto rechazado');
type(document.getElementById('pin-new'), '1234');
type(document.getElementById('pin-confirm'), '9999');
submit(q('form')); await sleep(40);
assert.match(q('.field__error').textContent, /no coinciden/); ok('PIN que no coincide rechazado');
type(document.getElementById('pin-confirm'), '1234');
submit(q('form')); await sleep(80); await settle();
assert.match(text(), /Elige un perfil/); assert.ok(q('a[href="#/parents/' + alex.id + '"]')); ok('crea el PIN y entra a la zona de padres');
const stored = rows("SELECT value FROM settings WHERE key='parent_pin'")[0].value;
assert.match(stored, /^[0-9a-f]{16}:[0-9a-f]{64}$/); assert.ok(!stored.includes('1234')); ok('el PIN se guarda con sal y hash, nunca en claro');

sessionStorage.clear();
await visit('#/parents');
assert.match(text(), /Introduce tu PIN/);
type(document.getElementById('pin-enter'), '0000');
submit(q('form')); await sleep(60);
assert.match(q('.field__error').textContent, /incorrecto/); ok('PIN incorrecto rechazado');
type(document.getElementById('pin-enter'), '1234');
submit(q('form')); await sleep(80); await settle();
assert.match(text(), /Elige un perfil/); ok('PIN correcto desbloquea');

await visit('#/parents/' + alex.id);
assert.match(text(), /aún no tiene actividad/); ok('perfil sin actividad: estado vacío');

/* ---------- 3b. Liberar temas ---------- */
assert.ok(q('a[href="#/parents/' + alex.id + '/release/4-primaria"]')); 
await visit('#/parents/' + alex.id + '/release/4-primaria');
assert.match(text(), /Liberar temas/); assert.equal(qa('.row-card').length, 5);
assert.match(qa('.row-card')[0].textContent, /0 de \d+ disponibles/); ok('liberar: lista de asignaturas con contador 0 de 1');
await visit('#/parents/' + alex.id + '/release/4-primaria/mates');
assert.equal(qa('.switch').length, 5); assert.equal(qa('.switch:disabled').length, 4);
assert.match(text(), /0 de 1 temas disponibles para Alex/);
q('.switch:not(:disabled)').click(); await sleep(150); await settle();
assert.equal(q('.switch:not(:disabled)').getAttribute('aria-checked'), 'true'); assert.match(text(), /1 de 1 temas disponibles/);
assert.equal(rows("SELECT * FROM topic_release WHERE profile_id='" + alex.id + "'").length, 1); ok('liberar: el interruptor guarda el tema en la base y actualiza el contador');
await visit('#/parents/' + alex.id + '/release/4-primaria');
assert.match(qa('.row-card')[0].textContent, /1 de 1 disponibles/);
await visit('#/p/' + alex.id + '/c/4-primaria/s/mates/study');
assert.equal(qa('a.topic-card').length, 1); ok('liberar: el tema liberado ya se puede abrir en Estudio');
await visit('#/parents/' + alex.id + '/release/4-primaria/mates');
q('.switch:not(:disabled)').click(); await sleep(150); await settle();
assert.equal(rows("SELECT * FROM topic_release WHERE profile_id='" + alex.id + "'").length, 0); assert.match(text(), /0 de 1 temas disponibles/); ok('liberar: apagar el interruptor vuelve a bloquear el tema');

/* ---------- 3c. Editar perfil ---------- */
await visit('#/');
assert.equal(qa('.profile-edit').length, 1); assert.ok(q('a.profile-edit[href="#/p/' + alex.id + '/edit"]')); assert.equal(qa('.profile-card a, a a').length, 0); ok('inicio: cada perfil tiene su lápiz de editar (sin enlaces anidados)');
await visit('#/parents/' + alex.id);
assert.ok(!q('a[href*="/edit"]')); ok('zona de padres: ya no tiene el botón de editar');
await visit('#/p/' + alex.id + '/edit');
assert.equal(document.getElementById('profile-name').value, 'Alex'); assert.equal(qa('.swatch')[1].getAttribute('aria-pressed'), 'true'); ok('editar: el formulario sale con el nombre y el color actuales');
type(document.getElementById('profile-name'), '   ');
submit(q('form')); await sleep(30);
assert.match(q('.field__error').textContent, /nombre/); ok('editar: no deja guardar sin nombre');
type(document.getElementById('profile-name'), 'Álex Pro');
qa('.swatch')[2].click();
submit(q('form')); await sleep(150);
assert.ok(document.querySelector('.modal--success')); assert.match(document.querySelector('.modal').textContent, /Perfil actualizado/); assert.match(document.querySelector('.modal').textContent, /Álex Pro/);
document.querySelector('.modal .btn').click(); await sleep(60); await settle();
assert.equal(location.hash, '#/');
const edited = rows("SELECT * FROM profiles WHERE id='" + alex.id + "'")[0];
assert.equal(edited.name, 'Álex Pro'); assert.equal(edited.avatar_color, '#FFA8C5'); assert.match(text(), /Álex Pro/); ok('editar: guarda nombre y color nuevos en D1 y vuelve al inicio');
await visit('#/p/' + alex.id + '/edit');
type(document.getElementById('profile-name'), 'Alex'); qa('.swatch')[1].click();
submit(q('form')); await sleep(150); document.querySelector('.modal .btn').click(); await sleep(60); await settle();
assert.equal(rows("SELECT name FROM profiles WHERE id='" + alex.id + "'")[0].name, 'Alex');

/* ---------- 4. Cursos y asignaturas ---------- */
await visit('#/p/' + alex.id);
assert.match(text(), /Hola, Alex/);
assert.equal(qa('.course-card').length, 6);
assert.equal(qa('a.course-card').length, 1); assert.ok(q('a.course-card--current')); assert.match(q('a.course-card--current').textContent, /4\.º.*Curso actual.*¡Entrar!/);
assert.equal(qa('.course-card--done').length, 3); assert.equal(qa('.course-card--done').map((n) => n.textContent).join('|'), '🏅1.ºSuperado ✅|🏅2.ºSuperado ✅|🏅3.ºSuperado ✅'); assert.match(text(), /Cursos superados/); assert.match(q('.cheer').textContent, /Sigue así/);
assert.equal(qa('button.course-card[aria-disabled="true"]').length, 2); assert.match(text(), /Próximos cursos/); assert.deepEqual(qa('button.course-card .course-card__n').map((n) => n.textContent), ['5.º', '6.º']);
assert.ok(q('a.course-card--current img[src^="icons/mochila"]'));
assert.ok(q('.app-header .avatar')); ok('cursos: 4.º grande con mochila, 1.º-3.º superados con mensaje, 5.º y 6.º próximos, icono del perfil en la cabecera');
qa('button.course-card')[0].click();
assert.match(document.querySelector('.modal').textContent, /Próximamente/); assert.match(document.querySelector('.modal').textContent, /5\.º se abrirá más adelante/); assert.ok(document.querySelector('.modal--info') && document.body.classList.contains('modal-open'));
document.querySelector('.modal .btn').click(); await sleep(10);
assert.equal(document.querySelector('.modal'), null); assert.ok(!document.body.classList.contains('modal-open')); ok('un curso bloqueado avisa con una ventana modal y se cierra con el botón');

await visit('#/p/' + alex.id + '/c/4-primaria');
assert.equal(qa('.row-card').length, 5);
assert.deepEqual(qa('.row-card__title').map((n) => n.textContent), ['Matemáticas', 'Sociales', 'Inglés', 'Lengua', 'Sciences']);
assert.match(qa('.chip').map((n) => n.textContent).join('|'), /Content in English/);
assert.deepEqual(qa('.subject-card .tile').map((n) => n.textContent), ['🧮', '🌍', '🇬🇧', '🔤', '🔬']); ok('asignaturas en orden, con idioma y su emoji');

await visit('#/p/' + alex.id + '/c/4-primaria/s/mates/study');
assert.equal(qa('a.topic-card').length, 0); assert.equal(qa('button.topic-card--locked').length, 5);
assert.equal(qa('.topic-card__meta').map((n) => n.textContent).filter((x) => /Sin liberar/.test(x)).length, 1);
assert.equal(qa('.topic-card__meta').map((n) => n.textContent).filter((x) => /Pronto/.test(x)).length, 4);
qa('button.topic-card--locked')[0].click();
assert.match(document.querySelector('.modal').textContent, /Tema no disponible/); assert.match(document.querySelector('.modal').textContent, /tus padres/);
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' })); await sleep(10); assert.equal(document.querySelector('.modal'), null);
qa('button.topic-card--locked')[1].click();
assert.match(document.querySelector('.modal').textContent, /llegará pronto/); document.querySelector('.modal-overlay').click(); await sleep(10); assert.equal(document.querySelector('.modal'), null); ok('sin liberar: el tema con contenido sale "No disponible" y el resto "Pronto"');
await visit('#/p/' + alex.id + '/c/4-primaria/s/mates/study/tablas');
assert.match(text(), /Tema no disponible/); assert.ok(!q('.lesson__h')); ok('abrir a mano la dirección de un tema bloqueado muestra "Tema no disponible"');
await visit('#/p/' + alex.id + '/c/4-primaria/s/mates/practice/tablas');
assert.match(text(), /Tema no disponible/); assert.ok(!q('.question__prompt')); ok('tampoco se puede practicar un tema bloqueado');
db.sqlite.prepare("INSERT INTO topic_release (id, profile_id, course_id, subject_id, topic_id) VALUES ('r1', ?, '4-primaria', 'mates', 'tablas')").run(alex.id);
await visit('#/p/' + alex.id + '/c/4-primaria/s/mates/study');
assert.equal(qa('.topic-card').length, 5);
assert.equal(qa('a.topic-card').length, 1); assert.equal(qa('button.topic-card--locked').length, 4); ok('estudio: 1 tema con contenido y 4 "Pronto"');
await visit('#/p/' + alex.id + '/c/4-primaria/s/ingles/practice');
assert.deepEqual(qa('.tabs__tab').map((n) => n.textContent), ['Study', 'Exercises']); assert.match(text(), /What do you want to practise\?/); ok('Inglés se muestra en inglés');

/* ---------- 5. Estudio ---------- */
await visit('#/p/' + alex.id + '/c/4-primaria/s/mates/study/tablas');
assert.ok(qa('.lesson__h').length >= 3); assert.ok(q('a[href*="/practice/tablas"]'));
q('.lesson__actions button').click(); await sleep(60);
assert.equal(rows('SELECT * FROM study_progress').length, 1); ok('lección: se muestra y "marcar como estudiado" guarda en D1');
await visit('#/p/' + alex.id + '/c/4-primaria/s/mates/study');
assert.match(text(), /Estudiado/); ok('la tarjeta del tema muestra "Estudiado"');

/* ---------- 6. Ejercicios ---------- */
const byPrompt = new Map(tablas.exercises.map((e) => [e.prompt, e]));
async function playSession(plan) {
  // plan(i) -> true si se debe acertar la pregunta número i
  for (let i = 0; !q('.result__score'); i++) {
    const question = byPrompt.get(q('.question__prompt').textContent);
    assert.ok(question, 'pregunta desconocida');
    const right = plan(i);
    if (question.type === 'choice') {
      const target = right ? question.options[question.answer] : question.options.find((_, k) => k !== question.answer);
      qa('.option').find((o) => o.textContent === target).click();
    } else {
      type(q('input.input'), right ? String(question.answer) : '999');
    }
    const action = q('.practice .btn--primary');
    assert.equal(action.disabled, false);
    action.click(); await sleep(5);
    assert.ok(q('.feedback'), 'debe haber corrección');
    assert.equal(!!q('.feedback--ok'), right);
    action.click(); await sleep(5);
  }
  await sleep(80);
}

await visit('#/p/' + alex.id + '/c/4-primaria/s/mates/practice/tablas');
assert.match(text(), /Pregunta 1 de 8/);
assert.equal(q('.practice .btn--primary').disabled, true); ok('ejercicios: "Comprobar" desactivado hasta responder');
await playSession((i) => i < 5);
assert.equal(q('.result__score').textContent, '5/8');
assert.equal(qa('.result__item').length, 3); assert.match(text(), /Resultado guardado/);
let sessions = rows('SELECT * FROM practice_sessions');
assert.equal(sessions.length, 1); assert.equal(sessions[0].total, 8); assert.equal(sessions[0].correct, 5);
assert.equal(rows('SELECT * FROM answers WHERE is_correct=1').length, 5); assert.equal(rows('SELECT * FROM answers').length, 8); ok('sesión de 8 preguntas: resultado 5/8, repaso de fallos y filas guardadas en D1');

await visit('#/p/' + alex.id + '/c/4-primaria/s/mates/practice/tablas');
await playSession(() => false);
assert.equal(q('.result__score').textContent, '0/8'); ok('segunda sesión (todo mal) guardada');

await visit('#/p/' + alex.id + '/c/4-primaria/s/mates/practice');
assert.match(text(), /5\/8/); ok('la tarjeta del tema muestra la mejor puntuación');

/* ---------- 7. Estadísticas y refuerzo ---------- */
await visit('#/parents/' + alex.id);
assert.equal(qa('.grid-3 .stat-chip').length, 3);
assert.match(qa('.grid-3 .stat-chip__value').map((n) => n.textContent).join('|'), /16\|31%\|0/);
assert.equal(qa('.stat-row').length, 5);
assert.equal(qa('.reinforce-card').length, 1);
assert.match(q('.reinforce-card').textContent, /Tablas de multiplicar/); assert.match(q('.reinforce-card').textContent, /31% de aciertos/);
assert.equal(q('.reinforce-card a'), null); ok('estadísticas: 16 ejercicios, 31 % de acierto, racha 0; tema en refuerzo sin enlace para practicarlo (zona de padres)');

await visit('#/parents/' + alex.id);
assert.equal(qa('.progress-row').length, 5); assert.match(qa('.progress-row')[0].textContent, /Matemáticas/); assert.match(qa('.progress-row')[0].textContent, /\d de 1 estudiados/); assert.match(qa('.progress-row')[1].textContent, /Sin temas liberados/);
assert.ok(q('a.progress-row[href="#/parents/' + alex.id + '/stats/4-primaria/mates"]')); ok('estadísticas: progreso del curso con una fila por asignatura que abre su detalle');
await visit('#/parents/' + alex.id + '/stats/4-primaria/mates');
assert.match(text(), /Detalle · Alex/); assert.equal(qa('.topic-stat').length, 1); assert.match(q('.topic-stat').textContent, /Tablas de multiplicar/); assert.match(q('.topic-stat').textContent, /\d+ intentos? · mejor \d+\/8 · últimas 24: \d+%/); assert.match(text(), /1 de 1 temas liberados/); ok('estadísticas: detalle de asignatura con liberado, intentos, mejor y media');
await visit('#/parents/' + alex.id + '/stats/4-primaria/sociales');
assert.match(text(), /0 de 1 temas liberados/); assert.match(q('.topic-stat').textContent, /No liberado/); assert.match(q('.topic-stat').textContent, /Sin ejercicios todavía/); assert.ok(q('.topic-stat--off')); ok('estadísticas: tema no liberado y sin ejercicios');

await visit('#/p/' + alex.id + '/c/4-primaria/s/mates/practice');
const redCards = qa('a.topic-card--red'); assert.equal(redCards.length, 1); assert.match(redCards[0].textContent, /Tablas de multiplicar/); assert.match(redCards[0].textContent, /A reforzar/); ok('ejercicios: el tema flojo (31 %) sale en rojo');
await visit('#/p/' + alex.id + '/c/4-primaria/s/mates/study');
assert.equal(qa('.topic-card--red, .topic-card--orange').length, 0); ok('estudio: no se colorea por refuerzo');
await visit('#/parents/' + alex.id + '/stats/4-primaria/mates');
assert.ok(q('.topic-stat--red')); assert.match(q('.topic-stat--red').textContent, /Refuerzo · 31%/); ok('detalle de padres: el tema flojo sale en rojo con su porcentaje');

/* ---------- 8. Sin conexión ---------- */
offline = true;
await visit('#/');
assert.ok(qa('.profile-card').length === 2 && /Alex/.test(text())); ok('sin conexión: el inicio muestra los perfiles guardados en el dispositivo');
await visit('#/p/' + alex.id + '/c/4-primaria/s/mates/practice/tablas');
assert.match(text(), /Pregunta 1 de 8/); ok('sin conexión: se puede abrir y hacer una sesión de ejercicios');
sessionStorage.clear();
await visit('#/parents');
assert.match(text(), /No hay conexión/); ok('sin conexión y bloqueada: la zona de padres no se abre desde la caché');
await visit('#/p/' + alex.id + '/c/4-primaria/s/mates/practice/tablas');
await playSession(() => true);
assert.match(text(), /Sin conexión: se guardará/);
assert.equal(rows('SELECT * FROM practice_sessions').length, 2);
assert.equal(JSON.parse(localStorage.getItem('aj.outbox')).length, 2); ok('sin conexión: el resultado se guarda en el dispositivo');
offline = false;
await flushOutbox();
assert.equal(rows('SELECT * FROM practice_sessions').length, 3);
assert.equal(rows('SELECT * FROM answers').length, 24);
assert.equal(JSON.parse(localStorage.getItem('aj.outbox')).length, 0); ok('al volver la conexión, la cola se envía en orden y queda vacía');
await flushOutbox();
assert.equal(rows('SELECT * FROM practice_sessions').length, 3); ok('reenviar la cola vacía no duplica nada');

/* ---------- 9. Errores y borrado ---------- */
await visit('#/p/no-existe');
assert.match(text(), /No hemos encontrado/); ok('perfil inexistente -> pantalla de no encontrado');
await visit('#/ruta/rara');
assert.match(text(), /No hemos encontrado/); ok('ruta desconocida -> pantalla de no encontrado');

sessionStorage.setItem('aj.parentsUnlockedUntil', String(Date.now() + 600000));
await visit('#/parents/' + alex.id);
q('.btn--danger').click(); await sleep(20);
assert.ok(document.querySelector('.modal--danger')); assert.match(document.querySelector('.modal').textContent, /¿Borrar el perfil de Alex\?/);
const modalBtns = [...document.querySelectorAll('.modal .btn')]; assert.deepEqual(modalBtns.map((b) => b.textContent), ['Cancelar', 'Borrar']);
modalBtns[0].click(); await sleep(40); assert.equal(rows('SELECT * FROM profiles').length, 1); assert.equal(document.querySelector('.modal'), null); ok('borrar: Cancelar cierra la ventana y no borra nada');
q('.btn--danger').click(); await sleep(20);
document.querySelectorAll('.modal .btn')[1].click(); await sleep(80); await settle();
assert.equal(rows('SELECT * FROM profiles').length, 0);
assert.equal(rows('SELECT * FROM practice_sessions').length, 0);
assert.equal(rows('SELECT * FROM answers').length, 0); ok('borrar el perfil elimina su progreso en cascada');

console.error = origError;
console.log('ERRS', JSON.stringify(errors.filter((e) => !/Página no encontrada|No encontrado|fetch failed|Experimental/.test(e))));
console.log(`\n${steps} comprobaciones de la app OK`);
process.exit(0);
