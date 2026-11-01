import assert from 'node:assert/strict';
import { isWeeklyReportTime } from '../worker/report-time.js';
import { recentPct, reinforceTopics } from '../worker/report-reinforce.js';
import { formatProfile, weeklyReport } from '../worker/report-format.js';
import { topicTitles, weeklyData } from '../worker/report-data.js';
import { runWeeklyReport } from '../worker/report-run.js';
import { makeD1 } from './d1-shim.js';

// Hora: domingo 20:00 de Madrid (invierno UTC+1, verano UTC+2)
assert.equal(isWeeklyReportTime(new Date('2026-11-01T19:00:00Z')), true); console.log('✓ domingo 20:00 (invierno)');
assert.equal(isWeeklyReportTime(new Date('2026-06-07T18:00:00Z')), true); console.log('✓ domingo 20:00 (verano)');
assert.equal(isWeeklyReportTime(new Date('2026-11-01T19:30:00Z')), false); assert.equal(isWeeklyReportTime(new Date('2026-11-02T19:00:00Z')), false); console.log('✓ otras horas y otros días, no');

// Refuerzo (igual que la app)
assert.equal(recentPct([{ total: 8, correct: 4, finished_at: '2026-10-30T10:00:00Z' }]), 50);
const rel = [{ course_id: 'c', subject_id: 's', topic_id: 'was-were' }, { course_id: 'c', subject_id: 's', topic_id: 'ok' }];
const ses = [
  { course_id: 'c', subject_id: 's', topic_id: 'was-were', total: 8, correct: 4, finished_at: '2026-10-30T10:00:00Z' },
  { course_id: 'c', subject_id: 's', topic_id: 'ok', total: 8, correct: 8, finished_at: '2026-10-30T10:00:00Z' },
  { course_id: 'c', subject_id: 's', topic_id: 'no-liberado', total: 8, correct: 1, finished_at: '2026-10-30T10:00:00Z' },
];
assert.deepEqual(reinforceTopics(ses, rel), ['c|s|was-were']); console.log('✓ refuerzo: solo temas liberados por debajo del 75 %');

// Formato: siempre las mismas líneas
const empty = { name: 'Mamá', gender: null, courseId: '1-primaria', streak: 0, retoDays: 0, weekDays: 7, newTopics: 0, studied: 0, released: 0, reinforce: [] };
const full = { name: 'Alex', gender: 'chico', courseId: null, streak: 5, retoDays: 5, weekDays: 7, newTopics: 3, studied: 12, released: 15, reinforce: ['4-primaria|mates|division', '4-primaria|ingles|was-were'] };
const titles = new Map([['4-primaria|mates|division', 'División con resto'], ['4-primaria|ingles|was-were', 'Was / were']]);
const lines = (p) => formatProfile(p).split('\n');
assert.equal(lines(empty).length, 6); assert.equal(lines(full).length, 6); console.log('✓ 6 líneas siempre');
assert.equal(lines(empty)[0], '🧑 Mamá · 1.º'); assert.equal(lines(full)[0], '👦 Alex · 4.º'); assert.match(lines(empty)[3], /sin temas liberados/); assert.match(lines(empty)[4], /⬜{8} 0 %/); assert.match(lines(empty)[5], /nada$/); console.log('✓ sin datos: aparecen todos los apartados');
assert.match(lines(full)[4], /🟩🟩🟩🟩🟩🟩⬜⬜ 80 %/); assert.equal(formatProfile(full).split('\n')[5], '⚠️ A reforzar: Division, Was were'); assert.equal(formatProfile(full, titles).split('\n')[5], '⚠️ A reforzar: División con resto, Was / were'); assert.match(lines(full)[1], /5 días/); console.log('✓ con datos: barra, refuerzo y racha');
assert.equal(weeklyReport([]).body, 'Todavía no hay perfiles.');
assert.match(weeklyReport([empty, full]).body, /Mamá[\s\S]*\n\n👦 Alex/); console.log('✓ informe con varios perfiles');

// Con la base de datos
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname);
db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color,gender,course_id) VALUES ('a','Alex','#1','chico','4-primaria'),('m','Mamá','#2',NULL,'1-primaria')`);
db.sqlite.exec(`INSERT INTO topic_release (id,profile_id,course_id,subject_id,topic_id) VALUES ('r1','a','4-primaria','mates','tablas'),('r2','a','4-primaria','mates','divisiones')`);
db.sqlite.exec(`INSERT INTO study_progress (id,profile_id,course_id,subject_id,topic_id,completed_at) VALUES ('s1','a','4-primaria','mates','tablas','2026-10-28T10:00:00Z')`);
db.sqlite.exec(`INSERT INTO practice_sessions (id,profile_id,course_id,subject_id,topic_id,total,correct,finished_at) VALUES ('p1','a','4-primaria','mates','divisiones',8,3,'2026-10-29T10:00:00Z')`);
db.sqlite.exec(`INSERT INTO reto_diario (id,profile_id,course_id,day,questions,answers,finished_at) VALUES ('d1','a','4-primaria','2026-10-27','[]','[]','2026-10-27T10:00:00Z'),('d2','a','4-primaria','2026-11-01','[]','[]','2026-11-01T10:00:00Z')`);
db.sqlite.exec(`INSERT INTO topic_titles (id,course_id,subject_id,topic_id,title) VALUES ('4-primaria|mates|divisiones','4-primaria','mates','divisiones','División con resto')`);
const data = await weeklyData(db, '2026-11-01');
assert.equal((await topicTitles(db)).get('4-primaria|mates|divisiones'), 'División con resto');
const a = data.find((p) => p.name === 'Alex'); const m = data.find((p) => p.name === 'Mamá');
assert.equal(a.retoDays, 2); assert.equal(a.newTopics, 1); assert.equal(a.released, 2); assert.equal(a.studied, 1); assert.deepEqual(a.reinforce, ['4-primaria|mates|divisiones']);
assert.equal(m.released, 0); assert.equal(m.retoDays, 0); console.log('✓ datos reales de la base de datos');

// Envío
const realFetch = globalThis.fetch; const sent = [];
globalThis.fetch = async (url, init) => { sent.push(JSON.parse(init.body)); return new Response('{}', { status: 200 }); };
const env = { DB: db, TELEGRAM_BOT_TOKEN: 'T', TELEGRAM_CHAT_ID: '-1' };
let r = await runWeeklyReport(env, new Date('2026-11-01T19:00:00Z').getTime());
assert.equal(r.sent, true); assert.equal(sent.length, 1); assert.equal(sent[0].parse_mode, 'HTML'); assert.match(sent[0].text, /^<b>📊 Resumen de la semana<\/b>\n\n<b>👦 Alex · 4\.º<\/b>[\s\S]*<b>A reforzar:<\/b> División con resto[\s\S]*<b>🧑 Mamá · 1\.º<\/b>/); console.log('✓ el domingo a las 20:00 se envía a Telegram');
r = await runWeeklyReport(env, new Date('2026-11-01T19:30:00Z').getTime()); assert.equal(r.report, false); assert.equal(sent.length, 1); console.log('✓ a otra hora no se envía');
r = await runWeeklyReport({ DB: db }, new Date('2026-11-01T19:00:00Z').getTime()); assert.equal(r.report, false); assert.ok(r.error); console.log('✓ sin Telegram no envía y lo dice');
globalThis.fetch = realFetch;
