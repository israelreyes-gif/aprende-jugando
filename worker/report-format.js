import { escapeHtml } from './telegram-html.js';

const DEFAULT_COURSE = '4-primaria';
const SQUARES = 8;
const MAX_REINFORCE = 5;

const faceOf = (gender) => (gender === 'chico' ? '👦' : gender === 'chica' ? '👧' : '🧑');
const courseLabel = (courseId) => `${(courseId || DEFAULT_COURSE).split('-')[0]}.º`;
const days = (n) => (n === 1 ? '1 día' : `${n} días`);
// Título del tema (tabla topic_titles); si falta, su id con espacios.
const humanize = (id) => id.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
const titleOf = (key, titles) => titles.get(key) || humanize(key.split('|')[2]);

// Dos formas de escribir lo mismo: texto plano (pruebas) y HTML de Telegram (negrita en lo importante).
const plain = { b: (s) => s, x: (s) => s };
const html = { b: (s) => `<b>${escapeHtml(s)}</b>`, x: escapeHtml };

function bar(done, total, { b }) {
  const pct = total > 0 ? Math.round((done * 100) / total) : 0;
  const filled = Math.round((pct * SQUARES) / 100);
  return `${'🟩'.repeat(filled)}${'⬜'.repeat(SQUARES - filled)} ${b(`${pct} %`)}`;
}

/** Línea de sincronización: siempre aparece, con el estado de la semana. */
function syncLine(sync, { b }) {
  const label = `🔄 ${b('Sincronización:')}`;
  if (!sync || (sync.activity === 0 && sync.late === 0 && sync.failed === 0)) return `${label} sin datos esta semana`;
  if (sync.failed > 0) return `${label} ⚠️ ${sync.late} con retraso, ${b(`${sync.failed} sin guardar`)}`;
  if (sync.late > 0) return `${label} ✅ todo guardado (${sync.late} con retraso)`;
  return `${label} todo guardado ✅`;
}

/** Bloque de un perfil. Siempre lleva las mismas líneas, aunque no haya datos. */
export function formatProfile(p, titles = new Map(), format = plain) {
  const { b, x } = format;
  const topics = p.released === 0 ? 'sin temas liberados' : `${p.studied} de ${p.released} liberados`;
  const shown = p.reinforce.slice(0, MAX_REINFORCE).map((key) => titleOf(key, titles));
  const extra = p.reinforce.length > MAX_REINFORCE ? ` y ${p.reinforce.length - MAX_REINFORCE} más` : '';
  return [
    b(`${faceOf(p.gender)} ${p.name} · ${courseLabel(p.courseId)}`),
    `🔥 ${b('Racha:')} ${days(p.streak)}`,
    `🎯 ${b('Retos:')} ${p.retoDays} de ${p.weekDays}`,
    `📚 ${b('Temas estudiados:')} ${p.newTopics} ${p.newTopics === 1 ? 'nuevo' : 'nuevos'} esta semana (${x(topics)})`,
    bar(p.studied, p.released, format),
    `⚠️ ${b('A reforzar:')} ${x(shown.length ? shown.join(', ') + extra : 'nada')}`,
    syncLine(p.sync, format),
  ].join('\n');
}

const TITLE = '📊 Resumen de la semana';

/** Mensaje completo para Telegram: { title, body } en texto plano y `html` con la negrita. */
export function weeklyReport(profiles, titles = new Map()) {
  const body = profiles.length ? profiles.map((p) => formatProfile(p, titles)).join('\n\n') : 'Todavía no hay perfiles.';
  const htmlBody = profiles.length ? profiles.map((p) => formatProfile(p, titles, html)).join('\n\n') : 'Todavía no hay perfiles.';
  return { title: TITLE, body, html: `${html.b(TITLE)}\n\n${htmlBody}` };
}
