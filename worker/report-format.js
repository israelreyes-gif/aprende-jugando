const DEFAULT_COURSE = '4-primaria';
const SQUARES = 8;
const MAX_REINFORCE = 5;

const faceOf = (gender) => (gender === 'chico' ? '👦' : gender === 'chica' ? '👧' : '🧑');
const courseLabel = (courseId) => `${(courseId || DEFAULT_COURSE).split('-')[0]}.º`;
const days = (n) => (n === 1 ? '1 día' : `${n} días`);
// Título del tema (tabla topic_titles); si falta, su id con espacios.
const humanize = (id) => id.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
const titleOf = (key, titles) => titles.get(key) || humanize(key.split('|')[2]);

function bar(done, total) {
  const pct = total > 0 ? Math.round((done * 100) / total) : 0;
  const filled = Math.round((pct * SQUARES) / 100);
  return `${'🟩'.repeat(filled)}${'⬜'.repeat(SQUARES - filled)} ${pct} %`;
}

/** Bloque de un perfil. Siempre lleva las mismas líneas, aunque no haya datos. */
export function formatProfile(p, titles = new Map()) {
  const topics = p.released === 0 ? 'sin temas liberados' : `${p.studied} de ${p.released} liberados`;
  const shown = p.reinforce.slice(0, MAX_REINFORCE).map((key) => titleOf(key, titles));
  const extra = p.reinforce.length > MAX_REINFORCE ? ` y ${p.reinforce.length - MAX_REINFORCE} más` : '';
  return [
    `${faceOf(p.gender)} ${p.name} · ${courseLabel(p.courseId)}`,
    `🔥 Racha: ${days(p.streak)}`,
    `🎯 Retos: ${p.retoDays} de ${p.weekDays}`,
    `📚 Temas estudiados: ${p.newTopics} nuevos esta semana (${topics})`,
    bar(p.studied, p.released),
    `⚠️ A reforzar: ${shown.length ? shown.join(', ') + extra : 'nada'}`,
  ].join('\n');
}

/** Mensaje completo: { title, body } para Telegram. */
export function weeklyReport(profiles, titles = new Map()) {
  const body = profiles.length ? profiles.map((p) => formatProfile(p, titles)).join('\n\n') : 'Todavía no hay perfiles.';
  return { title: '📊 Resumen de la semana', body };
}
