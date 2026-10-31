import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage });
const R = new URL('../js', import.meta.url).pathname;
let rows = []; let studied = null; // studied = null → todos los liberados están estudiados
globalThis.fetch = async (url) => ({ ok: true, json: async () => (String(url).includes('study_progress') ? (studied ?? rows) : rows) });
const { setConnection } = await import(`${R}/core/api.js`); setConnection('https://p.example/aprende-jugando', 'k');
const { loadRetoTopics } = await import(`${R}/features/reto/load-reto-topics.js`);
const { loadTopics } = await import(`${R}/content/registry.js`);
const row = (subject_id, topic_id, course_id = '4-primaria') => ({ profile_id: 'p1', course_id, subject_id, topic_id });
const mates = (await loadTopics('4-primaria', 'mates')).filter((t) => t.available).map((t) => t.id);
const none = (await loadTopics('4-primaria', 'sociales'));
console.log('sociales en tu app:', none.length, 'temas;', none.filter((t) => t.available).length, 'con contenido');
rows = [];
assert.deepEqual(await loadRetoTopics('p1', '4-primaria'), []); console.log('✓ sin temas liberados → []');
rows = [row('mates', mates[0]), row('mates', mates[1]), row('mates', 'no-existe'), row('mates', mates[2], '3-primaria'), row('sociales', 'relieve')];
const r = await loadRetoTopics('p1', '4-primaria');
assert.deepEqual(r.map((x) => x.topicId).sort(), [mates[0], mates[1]].sort()); console.log('✓ solo liberados, del curso, con contenido:', r.map((x) => x.topicId).join(', '));
assert.ok(r.every((x) => x.subjectId === 'mates' && x.title && x.exercises.length > 0)); console.log('✓ cada tema trae título y ejercicios');
rows = mates.map((id) => row('mates', id)); assert.equal((await loadRetoTopics('p1', '4-primaria')).length, 13); console.log('✓ los 13 de mates liberados → 13');

// Solo cuentan los estudiados
rows = [row('mates', mates[0]), row('mates', mates[1]), row('mates', mates[2])];
studied = [row('mates', mates[1])];
assert.deepEqual((await loadRetoTopics('p1', '4-primaria')).map((x) => x.topicId), [mates[1]]); console.log('✓ liberados y estudiados → solo el estudiado');
studied = []; assert.deepEqual(await loadRetoTopics('p1', '4-primaria'), []); console.log('✓ liberados sin estudiar → []');
rows = []; studied = [row('mates', mates[0])]; assert.deepEqual(await loadRetoTopics('p1', '4-primaria'), []); console.log('✓ estudiados pero no liberados → []');
rows = [row('mates', mates[0])]; studied = [row('mates', mates[0], '3-primaria')]; assert.deepEqual(await loadRetoTopics('p1', '4-primaria'), []); console.log('✓ estudiado en otro curso no cuenta');
