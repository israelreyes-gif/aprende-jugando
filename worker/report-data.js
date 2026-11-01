import { finishedRetoDays } from './reminder-data.js';
import { addDays, mondayOf } from './reminder-dates.js';
import { computeStreak } from './reminder-streak.js';
import { reinforceTopics } from './report-reinforce.js';

const keyOf = (row) => `${row.course_id}|${row.subject_id}|${row.topic_id}`;

/** Datos de la semana de un perfil. today: 'AAAA-MM-DD' (domingo). */
async function profileData(db, profile, today) {
  const all = async (sql) => (await db.prepare(sql).bind(profile.id).all()).results;
  const [doneDays, released, studied, sessions] = await Promise.all([
    finishedRetoDays(db, profile.id),
    all('SELECT course_id, subject_id, topic_id FROM topic_release WHERE profile_id = ?'),
    all('SELECT course_id, subject_id, topic_id, completed_at FROM study_progress WHERE profile_id = ?'),
    all('SELECT course_id, subject_id, topic_id, total, correct, finished_at FROM practice_sessions WHERE profile_id = ?'),
  ]);
  const monday = mondayOf(today);
  const releasedKeys = new Set(released.map(keyOf));
  return {
    name: profile.name,
    gender: profile.gender,
    courseId: profile.course_id,
    streak: computeStreak(doneDays, today),
    retoDays: doneDays.filter((d) => d >= monday && d <= today).length,
    weekDays: 7,
    newTopics: studied.filter((s) => String(s.completed_at).slice(0, 10) >= monday).length,
    studied: studied.filter((s) => releasedKeys.has(keyOf(s))).length,
    released: releasedKeys.size,
    reinforce: reinforceTopics(sessions, released),
    from: monday,
    to: addDays(monday, 6),
  };
}

/** Títulos de los temas (tabla topic_titles): Map "curso|asignatura|tema" → título. */
export async function topicTitles(db) {
  const rows = (await db.prepare('SELECT course_id, subject_id, topic_id, title FROM topic_titles').all()).results;
  return new Map(rows.map((row) => [keyOf(row), row.title]));
}

/** Datos de todos los perfiles, en orden de creación. */
export async function weeklyData(db, today) {
  const profiles = (await db.prepare('SELECT id, name, gender, course_id FROM profiles ORDER BY created_at ASC').all()).results;
  return Promise.all(profiles.map((profile) => profileData(db, profile, today)));
}
