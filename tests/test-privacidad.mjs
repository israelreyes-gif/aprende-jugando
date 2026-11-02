// Privacidad: al borrar un perfil no queda nada suyo, los avisos de sincronización antiguos se limpian
// y los textos que salen por Telegram no llevan datos de más.
import assert from 'node:assert/strict';
import { makeD1 } from './d1-shim.js';
import { purgeOldSyncEvents, purgeWeekly } from '../worker/purge-sync.js';
import { weeklyReport } from '../worker/report-format.js';
import { errorMessage } from '../worker/error-alert.js';

let n = 0; const ok = (m) => { n++; console.log('  ✓', m); };
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname);
const sql = (q) => db.sqlite.exec(q);
const count = (t) => db.sqlite.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;

// Dos perfiles con datos en todas las tablas
sql(`INSERT INTO profiles (id,name,avatar_color) VALUES ('a','Alex','#1'),('b','Mamá','#2')`);
for (const p of ['a', 'b']) {
  sql(`INSERT INTO practice_sessions (id,profile_id,course_id,subject_id,topic_id,total,correct,finished_at) VALUES ('s-${p}','${p}','c','s','t',8,5,'2026-10-29T10:00:00Z')`);
  sql(`INSERT INTO answers (id,session_id,question_id,is_correct,given) VALUES ('an-${p}','s-${p}','t:q',1,'texto')`);
  sql(`INSERT INTO study_progress (id,profile_id,course_id,subject_id,topic_id,completed_at) VALUES ('sp-${p}','${p}','c','s','t','2026-10-29T10:00:00Z')`);
  sql(`INSERT INTO topic_release (id,profile_id,course_id,subject_id,topic_id) VALUES ('tr-${p}','${p}','c','s','t')`);
  sql(`INSERT INTO reto_diario (id,profile_id,course_id,day,questions) VALUES ('rd-${p}','${p}','c','2026-10-29','[]')`);
  sql(`INSERT INTO push_devices (id,kind,profile_id,endpoint,p256dh,auth) VALUES ('pd-${p}','child','${p}','https://push/${p}','k','a')`);
  sql(`INSERT INTO sync_events (id,profile_id,outcome,what) VALUES ('se-${p}','${p}','late','practice_sessions')`);
}
const TABLES = ['practice_sessions', 'answers', 'study_progress', 'topic_release', 'reto_diario', 'push_devices', 'sync_events'];
for (const t of TABLES) assert.equal(count(t), 2, t);

sql(`DELETE FROM profiles WHERE id = 'a'`);
for (const t of TABLES) assert.equal(count(t), 1, `${t}: no debe quedar nada de Alex`);
assert.equal(db.sqlite.prepare(`SELECT COUNT(*) AS n FROM answers WHERE session_id = 's-a'`).get().n, 0);
ok('borrar un perfil borra sus sesiones, respuestas, progreso, temas liberados, retos, móviles y avisos de sincronización');
for (const t of TABLES) assert.equal(db.sqlite.prepare(`SELECT COUNT(*) AS n FROM ${t} WHERE id LIKE '%-b'`).get().n, 1, t);
ok('los datos de los demás perfiles no se tocan');

// Limpieza de avisos de sincronización antiguos
const now = Date.parse('2026-11-02T12:00:00Z');
sql(`INSERT INTO sync_events (id,profile_id,outcome,what,created_at) VALUES ('old','b','failed','x','2026-07-01T10:00:00Z'),('edge','b','late','x','2026-08-05T10:00:00Z'),('new','b','late','x','2026-10-30T10:00:00Z')`);
assert.equal(await purgeOldSyncEvents(db, now), 1);
assert.deepEqual(db.sqlite.prepare('SELECT id FROM sync_events ORDER BY id').all().map((r) => r.id), ['edge', 'new', 'se-b']); ok('se borran los avisos de más de 90 días y se conservan los recientes');
assert.equal(await purgeWeekly({ DB: db }, Date.parse('2026-11-02T19:00:00Z')), 0); ok('solo se limpia el domingo a la hora del resumen');
sql(`INSERT INTO sync_events (id,profile_id,outcome,what,created_at) VALUES ('old2','b','late','x','2026-01-01T10:00:00Z')`);
assert.equal(await purgeWeekly({ DB: db }, Date.parse('2026-11-01T19:00:00Z')), 1); ok('el domingo a las 20:00 se limpia');

// Lo que sale por Telegram: sin ids ni claves, solo nombre de pila, cifras y títulos
const text = weeklyReport([{ name: 'Alex', gender: 'chico', courseId: null, streak: 5, retoDays: 5, weekDays: 7, newTopics: 3, studied: 12, released: 15, reinforce: ['4-primaria|mates|division'], sync: { activity: 9, late: 0, failed: 0 } }], new Map([['4-primaria|mates|division', 'División con resto']])).body;
assert.doesNotMatch(text, /[0-9a-f]{8}-[0-9a-f]{4}|apikey|token|endpoint|@/i); ok('el resumen semanal no lleva ids, claves ni contactos');
const err = errorMessage({ where: 'GET /api/profiles', detail: 'Error interno' });
assert.doesNotMatch(JSON.stringify(err), /X-Api-Key|secreto|token/i); ok('las alertas de error no llevan claves');

console.log(`${n} comprobaciones de privacidad correctas`);
