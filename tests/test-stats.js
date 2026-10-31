import assert from 'node:assert/strict';
import { computeStats, bestAttempt, courseProgress, topicStats, reinforceLevel } from '../js/features/parents/stats.logic.js';

const subjects = ['mates', 'sociales', 'ingles', 'lengua', 'sciences'];
const s = (subject, topic, correct, total, finished) => ({ course_id: '4-primaria', subject_id: subject, topic_id: topic, correct, total, finished_at: finished });

// Sin datos
let r = computeStats([], subjects);
assert.equal(r.hasData, false);
assert.equal(r.summary.pct, null);
assert.equal(r.bySubject.every((x) => x.pct === null), true);
assert.deepEqual(r.reinforce, []);
console.log('  ✓ sin datos');

// Con datos
const sessions = [
  s('mates', 'tablas', 4, 8, '2026-10-24T09:00:00'),
  s('mates', 'tablas', 3, 8, '2026-10-23T09:00:00'),
  s('mates', 'tablas', 8, 8, '2026-09-01T09:00:00'), // antigua: fuera de los últimos 3
  s('mates', 'tablas', 2, 8, '2026-10-22T09:00:00'),
  s('ingles', 'verb-to-be', 8, 8, '2026-10-24T10:00:00'),
  s('lengua', 'sustantivo', 5, 8, '2026-10-20T10:00:00'),
  s('lengua', 'sustantivo', 6, 8, '2026-10-21T10:00:00'),
];
r = computeStats(sessions, subjects, 4);
assert.equal(r.hasData, true);
assert.equal(r.summary.questions, 56);
assert.equal(r.summary.pct, Math.round((4 + 3 + 8 + 2 + 8 + 5 + 6) * 100 / 56));
assert.equal(r.summary.streak, 4); assert.equal('activeDays' in r.summary, false);
console.log('  ✓ resumen global y racha (sustituye a los días activos)');

const mates = r.bySubject.find((x) => x.subjectId === 'mates');
assert.equal(mates.pct, Math.round((4 + 3 + 8 + 2) * 100 / 32));
assert.equal(r.bySubject.find((x) => x.subjectId === 'sociales').pct, null);
assert.deepEqual(r.bySubject.map((x) => x.subjectId), subjects);
console.log('  ✓ porcentaje por asignatura y orden');

// Refuerzo (umbral 75 %): mates/tablas últimos 3 = 38 % -> sí; lengua 11/16 = 69 % -> sí; inglés 100 % -> no
assert.equal(r.reinforce.length, 2);
assert.deepEqual(r.reinforce[1], { courseId: '4-primaria', subjectId: 'lengua', topicId: 'sustantivo', pct: 69 });
assert.deepEqual(r.reinforce[0], { courseId: '4-primaria', subjectId: 'mates', topicId: 'tablas', pct: 38 });
console.log('  ✓ refuerzo usa solo las últimas 24 preguntas (3 sesiones de 8) y el umbral del 75 %');

// Un tema recuperado deja de estar en refuerzo
const recovered = [...sessions, s('mates', 'tablas', 8, 8, '2026-10-24T11:00:00'), s('mates', 'tablas', 7, 8, '2026-10-24T11:30:00'), s('mates', 'tablas', 8, 8, '2026-10-24T12:00:00')];
assert.equal(computeStats(recovered, subjects).reinforce.some((x) => x.topicId === 'tablas'), false);
console.log('  ✓ el refuerzo desaparece al recuperarse');

// Orden: el más flojo primero
const two = [s('mates', 'a', 1, 8, '2026-10-24T09:00:00'), s('lengua', 'b', 3, 8, '2026-10-24T09:00:00')];
assert.deepEqual(computeStats(two, subjects).reinforce.map((x) => x.topicId), ['a', 'b']);
console.log('  ✓ refuerzos ordenados del más flojo al más fuerte');

assert.deepEqual(bestAttempt([s('m', 't', 3, 8, 'x'), s('m', 't', 7, 8, 'y'), s('m', 't', 5, 8, 'z')]), { correct: 7, total: 8 });
assert.equal(bestAttempt([]), null);
console.log('  ✓ mejor intento por tema');

console.log('\nStats OK');

// Progreso del curso
const T = (id, available = true) => ({ id, title: id, available });
const rel = (subject, topic) => ({ course_id: '4-primaria', subject_id: subject, topic_id: topic });
const prog = courseProgress(['mates', 'ingles'], { mates: [T('a'), T('b'), T('c'), T('d', false)], ingles: [] }, '4-primaria',
  [rel('mates', 'a'), rel('mates', 'b')], [rel('mates', 'a'), rel('mates', 'c')]);
assert.deepEqual(prog[0], { subjectId: 'mates', total: 3, released: 2, studied: 1 }); // c está estudiado pero no liberado: no cuenta
assert.deepEqual(prog[1], { subjectId: 'ingles', total: 0, released: 0, studied: 0 });
console.log('  ✓ progreso del curso: solo cuenta temas con contenido y estudiados liberados');

// Detalle por tema
const ts = topicStats([T('a'), T('b'), T('d', false)], '4-primaria', 'mates', [rel('mates', 'a')], [rel('mates', 'a')],
  [s('mates', 'a', 4, 8, '2026-10-24T09:00:00'), s('mates', 'a', 8, 8, '2026-10-23T09:00:00'), s('mates', 'b', 1, 8, '2026-10-22T09:00:00')]);
assert.equal(ts.length, 2);
assert.deepEqual(ts[0], { topicId: 'a', title: 'a', released: true, studied: true, attempts: 2, best: { correct: 8, total: 8 }, recentPct: 75, level: null });
assert.deepEqual(ts[1], { topicId: 'b', title: 'b', released: false, studied: false, attempts: 1, best: { correct: 1, total: 8 }, recentPct: 13, level: null }); // b no está liberado: sin color
console.log('  ✓ detalle por tema: liberado, estudiado, intentos, mejor y media');

// Niveles de refuerzo: rojo < 50, naranja 50-74, nada desde 75
assert.equal(reinforceLevel(null), null); assert.equal(reinforceLevel(49), 'red'); assert.equal(reinforceLevel(50), 'orange'); assert.equal(reinforceLevel(74), 'orange'); assert.equal(reinforceLevel(75), null); assert.equal(reinforceLevel(100), null);
const lv = topicStats([T('a'), T('b')], '4-primaria', 'mates', [rel('mates', 'a'), rel('mates', 'b')], [],
  [s('mates', 'a', 3, 8, '2026-10-24T09:00:00'), s('mates', 'b', 5, 8, '2026-10-24T09:00:00')]);
assert.equal(lv[0].level, 'red'); assert.equal(lv[1].level, 'orange');
// Solo cuentan los 3 últimos: un mal arranque antiguo ya no pesa
const rec = topicStats([T('a')], '4-primaria', 'mates', [rel('mates', 'a')], [],
  [s('mates', 'a', 1, 8, '2026-10-01T09:00:00'), s('mates', 'a', 8, 8, '2026-10-22T09:00:00'), s('mates', 'a', 8, 8, '2026-10-23T09:00:00'), s('mates', 'a', 7, 8, '2026-10-24T09:00:00')]);
assert.equal(rec[0].recentPct, 96); assert.equal(rec[0].level, null);
console.log('  ✓ niveles rojo/naranja y solo las últimas 24 preguntas');

// ---- Reto: sesiones de 1-2 preguntas con kind 'reto' ----
const rs = (topic, correct, total, finished, subject = 'mates') => ({ ...s(subject, topic, correct, total, finished), kind: 'reto' });
const { recentPct, REINFORCE_LAST_QUESTIONS } = await import('../js/features/parents/stats.logic.js');
assert.equal(REINFORCE_LAST_QUESTIONS, 24);
// 3 sesiones de 8 = 24 preguntas: igual que antes
assert.equal(recentPct([s('m', 't', 8, 8, '2026-10-01T09:00:00'), s('m', 't', 4, 8, '2026-10-02T09:00:00'), s('m', 't', 4, 8, '2026-10-03T09:00:00'), s('m', 't', 0, 8, '2026-10-04T09:00:00')]), Math.round(8 * 100 / 24));
// una pregunta del reto fallada NO desplaza a un intento entero de 8
const base = [s('m', 't', 8, 8, '2026-10-20T09:00:00'), s('m', 't', 8, 8, '2026-10-21T09:00:00'), s('m', 't', 8, 8, '2026-10-22T09:00:00')];
assert.equal(recentPct(base), 100);
assert.equal(recentPct([...base, rs('t', 0, 1, '2026-10-23T09:00:00')]), 96); // 23 de 24 (se prorratea la última sesión de 8)
assert.equal(recentPct([...base, rs('t', 0, 2, '2026-10-23T09:00:00')]), 92); // 22 de 24
// la ventana es de 24 preguntas aunque haya muchas sesiones pequeñas del reto
const many = Array.from({ length: 30 }, (_, i) => rs('t', i % 2, 1, `2026-10-${String(1 + (i % 28)).padStart(2, '0')}T0${i % 9}:00:00`));
assert.ok(recentPct(many) !== null);
// menos de 24 preguntas: se cuentan todas
assert.equal(recentPct([s('m', 't', 6, 8, '2026-10-20T09:00:00'), rs('t', 1, 1, '2026-10-21T09:00:00')]), Math.round(7 * 100 / 9));
assert.equal(recentPct([]), null);
console.log('  ✓ refuerzo: ventana de 24 preguntas; las del reto pesan solo lo suyo');

assert.deepEqual(bestAttempt([s('m', 't', 5, 8, 'x'), rs('t', 1, 1, 'y')]), { correct: 5, total: 8 }); // 1/1 no gana a 5/8
assert.equal(bestAttempt([rs('t', 1, 1, 'y')]), null);
const withReto = topicStats([T('a')], '4-primaria', 'mates', [rel('mates', 'a')], [], [s('mates', 'a', 4, 8, '2026-10-24T09:00:00'), rs('a', 1, 2, '2026-10-24T10:00:00')]);
assert.equal(withReto[0].attempts, 1); assert.deepEqual(withReto[0].best, { correct: 4, total: 8 }); assert.equal(withReto[0].recentPct, 50); assert.equal(withReto[0].level, 'orange');
const onlyReto = topicStats([T('a')], '4-primaria', 'mates', [rel('mates', 'a')], [], [rs('a', 0, 2, '2026-10-24T10:00:00')]);
assert.equal(onlyReto[0].attempts, 0); assert.equal(onlyReto[0].best, null); assert.equal(onlyReto[0].recentPct, 0); assert.equal(onlyReto[0].level, 'red');
console.log('  ✓ "intentos" y "mejor" solo cuentan ejercicios normales; el reto sí cuenta para el refuerzo');

const withRetoAll = computeStats([s('mates', 'a', 4, 8, '2026-10-24T09:00:00'), rs('b', 1, 2, '2026-10-24T10:00:00', 'sociales')], subjects, 2);
assert.equal(withRetoAll.summary.questions, 10); assert.equal(withRetoAll.summary.pct, 50); assert.equal(withRetoAll.bySubject.find((x) => x.subjectId === 'sociales').pct, 50);
console.log('  ✓ ejercicios hechos y acierto medio incluyen el reto');
