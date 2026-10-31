import assert from 'node:assert/strict';
const P = '../js/features/points/';
const { levelFor, LEVELS } = await import(P + 'levels.js');
const { sessionPoints } = await import(P + 'session-points.js');
const { summarizePoints } = await import(P + 'summarize-points.js');
const { periodPoints } = await import(P + 'period-points.js');
const { signed, pointsText, formatNumber } = await import(P + 'format-points.js');
let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };

// Niveles: justo en el límite y uno antes
const expected = [[0, 1], [49, 1], [50, 2], [119, 2], [120, 3], [219, 3], [220, 4], [349, 4], [350, 5], [519, 5], [520, 6], [749, 6], [750, 7], [1049, 7], [1050, 8], [1449, 8], [1450, 9], [1999, 9], [2000, 10], [99999, 10], [-5, 1]];
for (const [pts, lvl] of expected) assert.equal(levelFor(pts).n, lvl, `${pts} puntos`);
assert.deepEqual(LEVELS.map((l) => l.name), ['Explorador', 'Aprendiz', 'Curioso', 'Aventurero', 'Detective', 'Inventor', 'Experto', 'Campeón', 'Maestro', 'Leyenda']); ok('10 niveles, cada uno empieza en su punto exacto (0, 50, 120, 220, 350, 520, 750, 1050, 1450, 2000)');
const l = levelFor(258); assert.equal(l.name, 'Aventurero'); assert.equal(l.next.name, 'Detective'); assert.equal(l.toNext, 92); assert.equal(l.progress, Math.round((38 * 100) / 130)); assert.equal(levelFor(2500).next, null); assert.equal(levelFor(2500).progress, 100); ok('258 puntos: Aventurero, faltan 92 para Detective; el nivel 10 no tiene siguiente');

// Sesión: +1 / −1 y bonus ±5
assert.deepEqual(sessionPoints(8, 8), { right: 8, wrong: 0, base: 8, bonus: 5, total: 13 });
assert.deepEqual(sessionPoints(2, 8), { right: 2, wrong: 6, base: -4, bonus: -5, total: -9 });
assert.equal(sessionPoints(4, 8).total, 0); assert.equal(sessionPoints(4, 8).bonus, 0);
assert.equal(sessionPoints(5, 8).total, 2 + 5); assert.equal(sessionPoints(3, 8).total, -2 - 5); ok('sesión: +1 acierto, −1 fallo, bonus +5 si acaba en positivo, −5 si en negativo, 0 si queda en tablas');

// Resumen: ejercicios, reto (3 sesiones = 1 bonus), estudiados y días
const S = (id, correct, total, at, kind = 'practice') => ({ id, correct, total, finished_at: at, kind });
const sessions = [S('a', 8, 8, '2026-10-28T10:00:00Z'), S('b', 2, 8, '2026-10-28T11:00:00Z'), S('r1:mates:t', 3, 4, '2026-10-27T10:00:00Z', 'reto'), S('r1:lengua:t', 2, 3, '2026-10-27T10:00:01Z', 'reto'), S('r1:ingles:t', 2, 3, '2026-10-27T10:00:02Z', 'reto')];
const studied = [{ completed_at: '2026-10-26T09:00:00Z' }, { completed_at: '2026-10-28T09:00:00Z' }];
const s = summarizePoints({ sessions, studied });
// a: 8 -> +13 ; b: 2/8 -> -4-5 = -9 ; reto: 7/10 -> 4+5 = 9 ; estudiados 20
assert.equal(s.right, 8 + 2 + 7); assert.equal(s.wrong, 0 + 6 + 3); assert.equal(s.bonus, 5 - 5 + 5); assert.equal(s.studiedPts, 20); assert.equal(s.total, 13 - 9 + 9 + 20); assert.equal(s.raw, s.total); ok(`el reto cuenta como UNA sesión (un solo bonus aunque tenga 3 temas) · total ${s.total}`);
assert.equal(s.byDay.get('2026-10-28'), 13 - 9 + 10); assert.equal(s.byDay.get('2026-10-27'), 9); assert.equal(s.byDay.get('2026-10-26'), 10); ok('puntos por día correctos (en hora de España)');
const edge = summarizePoints({ sessions: [S('x', 0, 8, '2026-10-28T23:30:00Z')], studied: [] }); assert.equal(edge.raw, -13); assert.equal(edge.total, 0); assert.equal(edge.byDay.get('2026-10-29'), -13); ok('el total nunca baja de 0 (raw −13 → 0) y un fallo a las 23:30 UTC cuenta en el día siguiente de España');
assert.deepEqual(summarizePoints({ sessions: [], studied: [] }).total, 0); assert.doesNotThrow(() => summarizePoints({ sessions: [S('z', 1, 1, undefined)], studied: [{ completed_at: 'rota' }] })); ok('sin datos = 0 puntos; fechas rotas no rompen nada');

const per = periodPoints(s.byDay, '2026-10-28');
assert.equal(per.days.length, 7); assert.equal(per.days[6].day, '2026-10-28'); assert.equal(per.days[0].day, '2026-10-22'); assert.equal(per.today, 14); assert.equal(per.week, 14 + 9 + 10); ok('hoy y últimos 7 días');
assert.equal(signed(6), '+6'); assert.equal(signed(-3), '−3'); assert.equal(signed(0), '0'); assert.equal(pointsText(1), '+1 punto'); assert.equal(pointsText(-1), '−1 punto'); assert.equal(pointsText(-3), '−3 puntos'); assert.equal(formatNumber(1050), '1.050'); assert.equal(formatNumber(258), '258'); ok('formato: +6, −3, 0, "1 punto", 1.050');
console.log('\n' + n + ' comprobaciones OK');
