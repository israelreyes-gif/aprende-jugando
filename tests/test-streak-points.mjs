// Bonus de racha en el reto: si el reto acaba en positivo, suma tantos puntos como días de racha (hoy incluido).
import assert from 'node:assert/strict';
import { makeD1 } from './d1-shim.js';
import worker from '../worker/worker.js';
import { createSession } from '../worker/auth-sessions.js';
import { computeStreak } from '../js/features/reto/streak/compute-streak.js';
import { addDays } from '../js/features/reto/streak/date-keys.js';
import { streakByDay } from '../js/features/reto/streak/streak-by-day.js';
import { streakByDay as workerStreakByDay } from '../worker/stats-streak.js';
import { summarizePoints } from '../js/features/points/summarize-points.js';
import { summarizePointsJson } from '../worker/stats-summarize.js';
import { retoMessage } from '../js/features/push/parent-alerts/parent-messages.js';
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };

// 1) La racha de cada día sale igual que computeStreak, con cortesías y roturas, y la copia del Worker es idéntica
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let round = 0; round < 60; round++) {
  const days = []; for (let i = 0; i < 90; i++) if (rnd() < 0.7) days.push(addDays('2026-08-30', i));
  const mine = streakByDay(days);
  for (const d of days) assert.equal(mine.get(d), computeStreak(days, d), `${d}`);
  assert.deepEqual([...workerStreakByDay(days)], [...mine]);
}
assert.equal(streakByDay([]).size, 0); ok('la racha de cada día coincide con computeStreak (60 casos al azar) y el Worker tiene la misma');

// 2) Casos de la petición, con 10 preguntas por reto: 6 aciertos = +7 (con su bonus de +5); 3 aciertos = −9
const day = (i) => addDays('2026-11-01', i);
const sess = (retoId, correct, at) => ({ id: `${retoId}:mates:tablas`, kind: 'reto', correct, total: 10, finished_at: `${at}T10:00:00Z` });
const both = (input) => { const a = summarizePoints(input); const b = summarizePointsJson(input); assert.deepEqual({ ...b, byDay: new Map(Object.entries(b.byDay)) }, a); return a; };

// reto 10 en positivo (+7) con racha 10 → 17; reto 11 negativo → −9 (sin bonus); reto 12 positivo (+11) con racha 12 → 23
const retos = []; const sessions = [];
for (let i = 0; i < 12; i++) {
  retos.push({ id: `r${i}`, day: day(i) });
  const correct = i === 9 ? 6 : i === 10 ? 3 : i === 11 ? 8 : 3; // los 9 primeros, en negativo: sin bonus
  sessions.push(sess(`r${i}`, correct, day(i)));
}
let r = both({ sessions, studied: [], retos });
assert.equal(r.byDay.get(day(9)), 7 + 10); assert.equal(r.byDay.get(day(10)), -9); assert.equal(r.byDay.get(day(11)), 11 + 12);
assert.equal(r.streakBonus, 10 + 12); assert.equal(r.raw, 9 * -9 + 17 - 9 + 23); ok('reto positivo suma su racha (7+10, 11+12) y uno negativo no suma nada (−9)');

// 3) Reto con 0 puntos, ejercicios, mix y retos sin fila de reto terminado: sin bonus
r = both({ sessions: [sess('a', 5, day(0)), { id: 'p1', kind: 'practice', correct: 9, total: 10, finished_at: `${day(0)}T11:00:00Z` }, { id: 'm1:mates:t', kind: 'mix', correct: 9, total: 10, finished_at: `${day(0)}T12:00:00Z` }, sess('sinfila', 9, day(1))], studied: [], retos: [{ id: 'a', day: day(0) }] });
assert.equal(r.streakBonus, 0); ok('sin bonus: reto a 0, ejercicios, mix o reto sin fila terminada');

// 4) Un día sin reto: el primero es de cortesía (no suma ni rompe) y el segundo de la misma semana rompe la racha
const lun = '2026-11-16'; // lunes
const plan = [[0, true], [1, true], [2, false], [3, true], [4, false], [5, true]]; // lun, mar hechos; mié cortesía; jue hecho; vie falla → racha a 0; sáb hecho
const retos2 = []; const sessions2 = [];
for (const [i, hecho] of plan) if (hecho) { retos2.push({ id: `c${i}`, day: addDays(lun, i) }); sessions2.push(sess(`c${i}`, 8, addDays(lun, i))); }
r = both({ sessions: sessions2, studied: [], retos: retos2 });
assert.deepEqual([...r.byDay].map(([d, v]) => [d, v - 11]), [[addDays(lun, 0), 1], [addDays(lun, 1), 2], [addDays(lun, 3), 3], [addDays(lun, 5), 1]]); ok('la cortesía no rompe la racha y el segundo día sin reto la reinicia');

// 5) La racha se toma del día del reto (reto_diario.day), no de la hora de terminarlo
r = both({ sessions: [sess('x', 8, day(1))], studied: [], retos: [{ id: 'x', day: day(0) }] }); assert.equal(r.streakBonus, 1); ok('cuenta el día del reto');

// 6) Mensaje a los padres: los puntos incluyen la racha
const answers = Array.from({ length: 10 }, (_, i) => ({ correct: i < 8 }));
assert.match(retoMessage({ name: 'Alex', answers, streakBonus: 10 }).body, /\+21 puntos/); assert.match(retoMessage({ name: 'Alex', answers }).body, /\+11 puntos/); ok('el aviso a padres suma la racha');

// 7) Rutas del Worker: /api/stats/points y la lista de perfiles llevan el bonus
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname); const env = { DB: db, API_KEY: 'k' };
db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color) VALUES ('alex','Alex','#fff')`);
const insR = db.sqlite.prepare('INSERT INTO reto_diario (id,profile_id,course_id,day,questions,finished_at) VALUES (?,?,?,?,?,?)');
const insS = db.sqlite.prepare('INSERT INTO practice_sessions (id,profile_id,course_id,subject_id,topic_id,total,correct,duration_s,finished_at,kind) VALUES (?,?,?,?,?,?,?,?,?,?)');
for (let i = 0; i < 3; i++) { insR.run(`q${i}`, 'alex', '4-primaria', day(i), '[]', `${day(i)}T10:00:00Z`); insS.run(`q${i}:mates:tablas`, 'alex', '4-primaria', 'mates', 'tablas', 10, 8, 0, `${day(i)}T10:00:00Z`, 'reto'); }
insR.run('q9', 'alex', '4-primaria', day(3), '[]', null); insS.run('q9:mates:tablas', 'alex', '4-primaria', 'mates', 'tablas', 10, 8, 0, `${day(3)}T10:00:00Z`, 'reto'); // sin terminar: no cuenta como día de racha
const alex = await createSession(db, 'alex');
const res = await worker.fetch(new Request('http://w/api/stats/points?profile_id=eq.alex', { headers: { 'X-Api-Key': 'k', 'X-Session': alex } }), env); const body = await res.json();
assert.equal(body.streakBonus, 1 + 2 + 3); assert.equal(body.raw, 4 * (6 + 5) + 6); ok('GET /api/stats/points devuelve el bonus (solo retos terminados)');
const list = await (await worker.fetch(new Request('http://w/auth/profiles', { headers: { 'X-Api-Key': 'k' } }), env)).json();
assert.equal(list[0].points_total, body.total); ok('la lista de perfiles usa el mismo total');
console.log(`\n${n} comprobaciones OK`);
