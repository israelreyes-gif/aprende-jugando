import { spainDay } from '../reto/streak/date-keys.js';
import { streakByDay } from '../reto/streak/streak-by-day.js';
import { POINTS } from './rules.js';
import { sessionPoints } from './session-points.js';

// Un reto o un mix guardan varias sesiones (una por tema) que comparten el principio del id: cuentan como una sola.
const GROUPED_KINDS = new Set(['reto', 'mix']);

/** Agrupa las sesiones: un reto o un mix (varias sesiones, una por tema) cuenta como uno solo. */
function groupSessions(sessions) {
  const groups = new Map();
  for (const s of sessions) {
    const key = GROUPED_KINDS.has(s.kind) ? `${s.kind}:${String(s.id).split(':')[0]}` : `sesion:${s.id}`;
    const group = groups.get(key) || { correct: 0, total: 0, at: s.finished_at, retoId: s.kind === 'reto' ? String(s.id).split(':')[0] : null };
    group.correct += s.correct;
    group.total += s.total;
    if (s.finished_at > group.at) group.at = s.finished_at;
    groups.set(key, group);
  }
  return [...groups.values()];
}

function dayOf(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : spainDay(date);
}

/**
 * Suma todos los puntos de un perfil a partir de lo que ya está guardado (sesiones, temas estudiados y retos terminados).
 * Un reto que acaba en positivo suma además la racha de ese día (streakBonus). retos: [{ id, day }] de los retos terminados.
 * total nunca baja de 0; raw es la suma sin ese límite. byDay: puntos por día (hora de España).
 */
export function summarizePoints({ sessions, studied, retos = [] }) {
  const byDay = new Map();
  const streakAt = streakByDay(retos.map((r) => r.day));
  const dayOfReto = new Map(retos.map((r) => [String(r.id), r.day]));
  const add = (iso, n) => {
    const day = dayOf(iso);
    if (day) byDay.set(day, (byDay.get(day) || 0) + n);
  };

  let right = 0;
  let wrong = 0;
  let bonus = 0;
  let streakBonus = 0;
  for (const group of groupSessions(sessions)) {
    const p = sessionPoints(group.correct, group.total);
    const streak = p.total > 0 && group.retoId ? streakAt.get(dayOfReto.get(group.retoId)) || 0 : 0;
    right += p.right;
    wrong += p.wrong;
    bonus += p.bonus;
    streakBonus += streak;
    add(group.at, p.total + streak);
  }
  for (const row of studied) add(row.completed_at, POINTS.studied);

  const studiedPts = studied.length * POINTS.studied;
  const raw = right * POINTS.correct + wrong * POINTS.wrong + bonus + streakBonus + studiedPts;
  return { total: Math.max(0, raw), raw, right, wrong, bonus, streakBonus, studied: studied.length, studiedPts, byDay };
}
